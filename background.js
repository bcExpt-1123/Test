chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enableBlock: false,
  });
  chrome.storage.local.set({
    enableVpn: 0,
  });
});


chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    console.log(tabs);
    chrome.storage.local.get("enableBlock", (data) => {
      let url= tabs[0] && tabs[0].url;

      if(/^https:\/\/\/*$/.test(url) && data.enableBlock) {
          chrome.scripting.executeScript({
                  target: { tabId: details.tabId },
                  files: ["./content/script.js"]
          })
          .then(() => {
            console.log('Injected Success!')
          });
      }
    });
   
  });

})


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "adblock") {
    chrome.storage.local.get("enableBlock", (data) => {
      if(data.enableBlock == true){
        chrome.declarativeNetRequest.updateEnabledRulesets(
          {
            enableRulesetIds: ["ruleset_1", "ruleset_2"],
          },
          async () => {
            sendResponse({
              message: "enabled success"
            });
      
          }
        );
      }
      else{
        chrome.declarativeNetRequest.updateEnabledRulesets(
          {
            disableRulesetIds: ["ruleset_1", "ruleset_2"],
          },
          async () => {
            sendResponse({
              message: "disabled success"
            });
      
          }
        );
      }
    });
    
    return true;
  } else if (request.action === "vpn") {
    chrome.storage.local.get("enableVpn", (data) => {
      if(data.enableVpn){
        chrome.storage.local.get("vpnIPAdress", (data1) => {
          try {
            chrome.proxy.settings.set(
              {
                value: {
                  mode: "fixed_servers",
                  rules: {
                    singleProxy: {
                      scheme: "http",
                      host: data1.vpnIPAdress.hostName,
                      port: data1.vpnIPAdress.port
                    },
                  }
                },
                
                scope: "regular",
              },
              function () {
                console.log("Proxy set up.");
              }
            );
          } catch (err) {
            console.log(err);
          }
          
        })
      }
      else{
        chrome.proxy.settings.clear({ scope: "regular" }, function () {
          console.log("Proxy settings cleared.");
        });
      }
    });
    return true;
  }
});
