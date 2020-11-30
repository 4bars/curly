class ManipulatorService {

  static async changeColumnValue(token, boardId, itemId, columnId, targetValue, status) {
    try {
      const mondayClient = initMondayClient({ token });

      const query = `mutation change_column_value($boardId: Int!, $itemId: Int!, $columnId: String!, $value: JSON!) {
        change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: status) {
          id
        }
      }
      `;
      const variables = { boardId, columnId, itemId, status };

      const response = await mondayClient.api(query, { variables });
      return response;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = ManipulatorService;
