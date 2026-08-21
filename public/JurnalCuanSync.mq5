//+------------------------------------------------------------------+
//|                                              JurnalCuanSync.mq5  |
//|                                      Copyright 2026, Jurnal Cuan |
//|                                   https://jurnalcuan.vercel.app  |
//+------------------------------------------------------------------+
#property copyright "Jurnal Cuan"
#property link      "https://jurnalcuan.vercel.app"
#property version   "1.00"
#property description "Auto-sync closed trades from MetaTrader 5 to Jurnal Cuan Web Dashboard via HTTP Webhook."

//--- Inputs
input string InpWebhookUrl = "https://jurnalcuan.vercel.app/api/sync/mt5"; // Webhook URL Endpoint
input string InpSyncApiKey = "jc_live_your_api_key_here";                  // Dedicated Sync API Key

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("JurnalCuanSync EA Initialized Successfully. Listening for closed deals...");
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| TradeTransaction function                                        |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
  {
   // Check if transaction is a closed deal (DEAL_ENTRY_OUT)
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
     {
      ulong deal_ticket = trans.deal;
      if(HistoryDealSelect(deal_ticket))
        {
         ENUM_DEAL_ENTRY entry = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(deal_ticket, DEAL_ENTRY);
         if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_INOUT)
           {
            // Gather Deal Data
            string symbol      = HistoryDealGetString(deal_ticket, DEAL_SYMBOL);
            long   type        = HistoryDealGetInteger(deal_ticket, DEAL_TYPE);
            double volume      = HistoryDealGetDouble(deal_ticket, DEAL_VOLUME);
            double price       = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
            double profit      = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
            double commission  = HistoryDealGetDouble(deal_ticket, DEAL_COMMISSION);
            double swap        = HistoryDealGetDouble(deal_ticket, DEAL_SWAP);
            long   position_id = HistoryDealGetInteger(deal_ticket, DEAL_POSITION_ID);
            string comment     = HistoryDealGetString(deal_ticket, DEAL_COMMENT);
            datetime time      = (datetime)HistoryDealGetInteger(deal_ticket, DEAL_TIME);

            // Construct JSON Payload
            string json = StringFormat(
               "{\"ticket\":\"%d\",\"symbol\":\"%s\",\"type\":\"%s\",\"lots\":%.2f,\"close_price\":%.5f,\"profit\":%.2f,\"commission\":%.2f,\"swap\":%.2f,\"close_time\":\"%s\",\"comment\":\"%s\"}",
               position_id,
               symbol,
               (type == DEAL_TYPE_BUY ? "BUY" : "SELL"),
               volume,
               price,
               profit,
               commission,
               swap,
               TimeToString(time, TIME_DATE|TIME_SECONDS),
               comment
            );

            // Send via Webhook
            SendWebhook(json);
           }
        }
     }
  }

//+------------------------------------------------------------------+
//| Send HTTP POST Webhook                                           |
//+------------------------------------------------------------------+
void SendWebhook(string json_body)
  {
   char post_data[];
   char result_data[];
   string result_headers;
   
   StringToCharArray(json_body, post_data, 0, WHOLE_ARRAY, CP_UTF8);
   ArrayResize(post_data, ArraySize(post_data)-1); // Remove null terminator

   string headers = StringFormat("Content-Type: application/json\r\nx-api-key: %s\r\n", InpSyncApiKey);

   int timeout = 5000; // 5 seconds
   int res = WebRequest("POST", InpWebhookUrl, headers, timeout, post_data, result_data, result_headers);

   if(res == 200)
     {
      Print("JurnalCuanSync: Trade successfully synced to cloud!");
     }
   else
     {
      PrintFormat("JurnalCuanSync: Webhook failed with code %d. Make sure URL is added to WebRequest Allowed URLs.", res);
     }
  }
