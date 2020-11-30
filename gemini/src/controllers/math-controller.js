const mondayService = require('../services/monday-service');
const manipulatorService = require('../services/manipulator-service');
const math = require('mathjs');
const API_TOKEN = process.env.API_TOKEN;



async function binaryCalcuation(req, res) {
  const { payload } = req.body;
  let operation = req.query.operation;
  const { inboundFieldValues } = payload;

  console.log(payload);

  if(operation == "subtract")
  {
    const { boardId, statusColumnId, statusColumnValue, targetValue, itemId, sourceColumnId, targetColumnId } = inboundFieldValues;
    const token = API_TOKEN;
    const source_col_result = await mondayService.getColumnValue(token, itemId, sourceColumnId);
    const target_col_result = await mondayService.getColumnValue(token, itemId, targetColumnId);

    var temp_1 = source_col_result;
    temp_1 = temp_1.replace(/"/g,"");

    var temp_2 = target_col_result;
    temp_2 = temp_2.replace(/"/g,"");

    //lt,gt,lte,gte
    let comparator = req.query.result;

    if(comparator == "lt")
    {
      if (math.abs(Number(temp_1) - Number(temp_2)) < Number(targetValue)) {
        await mondayService.changeColumnValue(token, boardId, itemId, statusColumnId, statusColumnValue);
        return res.status(200).send({});
      }
      else {
        return res.status(200).send({});
      }
    }
    if(comparator == "gt")
    {
      if (math.abs(Number(temp_1) - Number(temp_2)) > Number(targetValue)) {
        await mondayService.changeColumnValue(token, boardId, itemId, statusColumnId, statusColumnValue);
        return res.status(200).send({});
      }
      else {
        return res.status(200).send({});
      }
    }

  }

  if(operation == "lt")
  {
    const { boardId, statusColumnId, statusColumnValue, targetValue, itemId, sourceColumnId } = inboundFieldValues;
    const token = API_TOKEN;
    const result = await mondayService.getColumnValue(token, itemId, sourceColumnId);

    var temp = result;
    temp = temp.replace(/"/g,"");
    console.log(Number(temp));
    console.log(Number(targetValue));

    if (Number(temp) < Number(targetValue)) {
      await mondayService.changeColumnValue(token, boardId, itemId, statusColumnId, statusColumnValue);
      return res.status(200).send({});
    }
    else {
      return res.status(200).send({});
    }
  }

  if(operation == "gt")
  {
    const { boardId, statusColumnId, statusColumnValue, targetValue, itemId, sourceColumnId } = inboundFieldValues;
    const token = API_TOKEN;
    const result = await mondayService.getColumnValue(token, itemId, sourceColumnId);

    var temp = result;
    temp = temp.replace(/"/g,"");
    console.log(Number(temp));
    console.log(Number(targetValue));

    if (Number(temp) > Number(targetValue)) {
      await mondayService.changeColumnValue(token, boardId, itemId, statusColumnId, statusColumnValue);
      return res.status(200).send({});
    }
    else {
      return res.status(200).send({});
    }
  }

}

module.exports = {
  binaryCalcuation
};
