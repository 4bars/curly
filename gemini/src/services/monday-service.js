const initMondayClient = require('monday-sdk-js');

class MondayService {

  static async getcolumnType(token, itemId, columnId, boardId){
    try {
      const mondayClient = initMondayClient();
      mondayClient.setToken(token);

      const query = `query($boardId: [Int]) {
        boards (ids: $boardId) {
          columns {
            id
            type
          }
        }
      }`;
      const variables = { boardId };

      const response = await mondayClient.api(query, { variables });


      var colDataType = response.data.boards[0].columns.filter(function(v){
          return v.id == columnId;
      });
      return colDataType[0].type;
    } catch (err) {
      console.log(err);
    }
  }

  static async getItemName(token, itemId) {
    try {
      const mondayClient = initMondayClient();
      mondayClient.setToken(token);

        const query = `query($itemId: [Int]) {
          items (ids: $itemId) {
            name
          }
        }`;
        const variables = { itemId };

        const response = await mondayClient.api(query, { variables });
        return response.data.items[0].name;

    } catch (err) {
      console.log(err);
    }
  }



  static async getColumnValue(token, itemId, columnId) {
    try {
      const mondayClient = initMondayClient();
      mondayClient.setToken(token);

        const query = `query($itemId: [Int], $columnId: [String]) {
          items (ids: $itemId) {
            column_values(ids:$columnId) {
              value
            }
          }
        }`;
        const variables = { columnId, itemId };

        const response = await mondayClient.api(query, { variables });
        return response.data.items[0].column_values[0].value;

    } catch (err) {
      console.log(err);
    }
  }

  static async changeColumnValue(token, boardId, itemId, columnId, targetValue, targetColType) {
    try {

      const mondayClient = initMondayClient({ token });

      const json_query = `mutation change_column_value($boardId: Int!, $itemId: Int!, $columnId: String!, $value: JSON!) {
        change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
          id
        }
      }
      `;


      const string_query = `mutation change_simple_column_value($boardId: Int!, $itemId: Int!, $columnId: String!, $value: String!) {
        change_simple_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
          id
        }
      }
      `;

      if(targetColType == "dropdown"){
      var  targetValueJson = JSON.stringify({"labels": [targetValue]});
      const variables = { boardId: boardId, columnId: columnId , itemId: itemId, value: targetValueJson};
      console.log(variables);
      const response = await mondayClient.api(json_query, { variables });
      console.log(response);
      return response;
      }
      else if(targetColType == "long-text"){
        const variables = { boardId: boardId, columnId: columnId , itemId: itemId, value: targetValue};
        console.log(variables);
        const response = await mondayClient.api(string_query, { variables });
        console.log(response);
        return response;
      }
      else if(targetColType == "text"){
        const variables = { boardId: boardId, columnId: columnId , itemId: itemId, value: targetValue};
        console.log(variables);
        const response = await mondayClient.api(string_query, { variables });
        console.log(response);
        return response;
      }
      else if(targetColType == "numeric"){
        const variables = { boardId: boardId, columnId: columnId , itemId: itemId, value: targetValue};
        console.log(variables);
        const response = await mondayClient.api(string_query, { variables });
        console.log(response);
        return response;
      }
      else {
        return "";
      }


    } catch (err) {
      console.log(err);
    }
  }

  static async changeColumnStatus(token, boardId, itemId, columnId, value) {
    try{
      const mondayClient = initMondayClient({ token });

      const query = `mutation change_column_value($boardId: Int!, $itemId: Int!, $columnId: String!, $value: JSON!) {
        change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
          id
        }
      }
      `;
      const variables = { boardId, columnId, itemId, value };

      const response = await mondayClient.api(query, { variables });
      return response;
    }
    catch(err){
      console.log(err);
    }
  }
}

module.exports = MondayService;
