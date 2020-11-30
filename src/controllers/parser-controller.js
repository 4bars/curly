const mondayService = require('../services/monday-service');
const jsonpath = require('jsonpath');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser
const API_TOKEN = process.env.API_TOKEN;
const fetch = require('node-fetch');
const url = require('url').URL;
const {CURLParser} = require('parse-curl-js');
const { curly } = require('node-libcurl');
const tls = require('tls');
const fs = require('fs');
const path = require('path');
const certFilePath = path.join(__dirname, 'cert.pem');
const tlsData = tls.rootCertificates.join('\n');
var {parseArgsStringToArgv} = require('string-argv');
var querystring = require('querystring');

fs.writeFileSync(certFilePath, tlsData);

async function parseAndUpdateColumn(req, res) {

try{
  let dataType = req.query.dataType;
  let sendCurl = req.query.curl;
  let mapResponse = req.query.map;

  console.log(req.query);

  const { payload } = req.body;

  const token = API_TOKEN;

  if(dataType == "xml"){
    const { inboundFieldValues } = payload;
    const { boardId, targetColumnId, sourceColumnId, itemId, xmlPath } = inboundFieldValues;
    var source_url = await mondayService.getColumnValue(token, itemId, sourceColumnId);

    if(source_url != null){
      source_url = source_url.replace(/"/g,"");
      console.log(source_url);
      const xmlSourceURL = new URL(source_url);
      var hostname = xmlSourceURL.hostname;
      var path = xmlSourceURL.pathname;


     const response = await fetch(source_url);
     const source_xml_string =  await response.text();


    var doc = new dom().parseFromString(source_xml_string);
    var nodes = xpath.select(xmlPath, doc);
    const result = nodes[0].firstChild.data;


    const targetColType = await mondayService.getcolumnType(token, itemId, targetColumnId, boardId);
    console.log(targetColType);

    await mondayService.changeColumnValue(token, boardId, itemId, targetColumnId, result, targetColType);
    return res.status(200).send({});
    }
    else {
      return res.status(200).send({});
    }
  }

  if(dataType == "json"){
    const { inboundFieldValues } = payload;
    console.log(payload);
    const { boardId, targetColumnId, sourceColumnId, itemId, jsonPath, curlReq, Mapping } = inboundFieldValues;
    var source_json_string;
    var source_js_obj;

    if(sendCurl == "true"){

      var cURLStr = curlReq;
      cURLStr = cURLStr.replace(/ --(data-urlencode)/g, ' -d');
      cURLStr = cURLStr.replace(/ --(data-binary)/g, ' -d');
      cURLStr = cURLStr.replace(/ --(data)/g, ' -d');

      console.log(cURLStr);

      const cURLParser = new CURLParser(cURLStr);
      const curlObj = cURLParser.parse();
      console.log(curlObj);
      let curl_url = curlObj.url;

      //get curl body data
      var body_data = [];
      var args = parseArgsStringToArgv (cURLStr);
      for(var i = 0; i < args.length; i++){
        if(args[i] == '-d'){
          body_data.push(querystring.parse(args[i+1]));
        }
      }


      curlObj.body.data = body_data;
      console.log(curlObj.body.data);
      let rx = /\${\w+}/g;
      var url_variables = curlObj.url.match(rx);

      //lookup url varibles in monday.com
      if(url_variables != null)
      {
        for (var i = 0; i < url_variables.length; i++) {
          var targetValue = url_variables[i].replace('$', '').replace('{','').replace('}','');
          if(targetValue == 'itemName'){
            var col_result = await mondayService.getItemName(token, itemId);
          }
          else{
            var col_result = await mondayService.getColumnValue(token, itemId, targetValue);
          }
          if(col_result == null){
            throw "parameter cannot be null";
          }
          var regExp = new RegExp(url_variables[i].replace('$', '\\$'));
          curl_url= curl_url.replace(regExp, col_result.replace(/"/g,""));
        }
      }


      //lookup payload data in monday.com
      if(curlObj.body.data.length != 0)
      {
        for (var i = 0; i < curlObj.body.data.length; i++) {
          let paramVars = JSON.stringify(curlObj.body.data[i]).match(rx);
          if(paramVars.length != 0){
            for (var j = 0; j < paramVars.length; j++) {

              var targetValue =  paramVars[j].replace('$', '').replace('{','').replace('}','');
              if(targetValue == 'itemName'){
                var col_result = await mondayService.getItemName(token, itemId);
              }
              else{
                var col_result = await mondayService.getColumnValue(token, itemId, targetValue);
              }

              if(col_result == null){
                throw new Error('Body parameter cannot be null');
              }
              var regExp = new RegExp(paramVars[j].replace('$', '\\$'));
              curlObj.body.data[i] = JSON.stringify(curlObj.body.data[i]).replace(regExp, col_result.replace(/"/g,""));
              curlObj.body.data[i] = JSON.parse(curlObj.body.data[i]);
            }
          }
        }
      }


      let curl_method = curlObj.method;
      curl_url = curl_url.replace(/'/g,'');

      console.log(curl_url);

      if(curl_method == 'GET')
      {
        const { statusCode, data, headers } = await curly.get(curl_url, { caInfo: certFilePath});
        source_js_obj = data;
      }
      else if(curl_method == 'POST')
      {
        var curlObjHeaders = [];
        curlObjHeaders.push(Object.keys(curlObj.headers)[0] + ':' + Object.values(curlObj.headers)[0]);
        var curlObjData = curlObj.body.data;
        const postFieldsObj = Object.assign({}, ...curlObjData);


        console.log(curlObjHeaders);
        console.log(postFieldsObj);

        const { statusCode, data, headers } = await curly.post(curl_url,
          { POSTFIELDS: querystring.stringify(postFieldsObj),
            httpHeader: curlObjHeaders,
            caInfo: certFilePath
          });
        source_js_obj = data;

      }

    }
    else {
      source_json_string = await mondayService.getColumnValue(token, itemId, sourceColumnId);
    }



    if(source_json_string != null || source_js_obj != null){


      if(mapResponse == "true"){

        console.log(source_js_obj);
        if(source_js_obj == null){
          source_json_obj = JSON.parse(source_json_string);
        }

        var colValMappingStr = Mapping.replace((/  |\r\n|\n|\r/gm),"");
        console.log(colValMappingStr);
        var colValMapping = JSON.parse(colValMappingStr);

        for (var key of Object.keys(colValMapping)) {
          var colValMapResult = jsonpath.query(source_js_obj, colValMapping[key]);
          var modifiedcolValMapResult;

          if(typeof colValMapResult == "object" && colValMapResult.length != null)
          {
            modifiedcolValMapResult = colValMapResult.join();
            var colValTargetType = await mondayService.getcolumnType(token, itemId, key, boardId);
            await mondayService.changeColumnValue(token, boardId, itemId, key, modifiedcolValMapResult, colValTargetType);
          }
          else {
            modifiedcolValMapResult = colValMapResult;
            var colValTargetType = await mondayService.getcolumnType(token, itemId, key, boardId);
            await mondayService.changeColumnValue(token, boardId, itemId, key, modifiedcolValMapResult, colValTargetType);
          }
        }
        return res.status(200).send({});
      }
      else {
        console.log(source_js_obj);
        if(source_js_obj == null){
          source_json_obj = JSON.parse(source_json_string);
        }
        console.log(jsonPath);
        const result = jsonpath.query(source_js_obj, jsonPath);

        console.log(result);

        if(typeof result == "object" && result.length != null)
        {
          var modifiedResult = result.join();
          const targetColType = await mondayService.getcolumnType(token, itemId, targetColumnId, boardId);
          await mondayService.changeColumnValue(token, boardId, itemId, targetColumnId, modifiedResult, targetColType);
        }
        else {
          const targetColType = await mondayService.getcolumnType(token, itemId, targetColumnId, boardId);
          await mondayService.changeColumnValue(token, boardId, itemId, targetColumnId, result, targetColType);
        }

        return res.status(200).send({});
      }

    }
    else{
      return res.status(200).send({});
    }
  }
}
catch(err){
  console.log(err);
  return res.status(200).send({});
}
}

  module.exports = {
    parseAndUpdateColumn
  };
