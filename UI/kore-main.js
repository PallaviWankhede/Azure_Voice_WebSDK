(function($){

     console.log("In function($) in koremain.js");
     // hoonartek customization for iframe issue
    $(document).on('click', '.minimize-btn, .close-btn', function() {
        console.log("In $(document).on('click', '.minimize-btn, .close-btn'in koremain.js");
        window.parent.postMessage('closeButtonClicked', '*');
    });

   $(document).on('click', '.minimized', function() {
        console.log("In $(document).on('click', '.minimized', function() in koremain.js");
        window.parent.postMessage('expandBtn', '*');
    });
    // hoonartek customization for iframe issue ends

//hoonartek kore customization for mic on off
         $(document).on('click', '.notRecordingMicrophone', function(e) {
              console.log("In $(document).on('click', '.notRecordingMicrophone', function(e) in koremain.js");
              // console.log("e.originalEvent: ",e.originalEvent)
           if(e.originalEvent)sessionStorage.setItem("mic",true)
       });
       $(document).on('click', '.recordingMicrophone', function(e) {
            console.log("In $(document).on('click', '.recordingMicrophone', function(e) in koremain.js");
           if(e.originalEvent)sessionStorage.setItem("mic",false)
       });
//hoonartek kore customization for mic on off ends
    
    $(document).ready(function () {
         console.log("In $(document).ready(function ()) in koremain.js");         
        function assertion(options, callback) {
             console.log("In function assertion in koremain.js");
            //kore customization
            var sessionId;
            if(!localStorage.getItem('session')){
                sessionId = Math.floor(100000 + Math.random() * 900000);
            localStorage.setItem('session',sessionId);
            }
            else{
            sessionId=localStorage.getItem('session')
            }
            //kore customization
            var jsonData = {
                "clientId": options.clientId,
                "clientSecret": options.clientSecret,
                "identity": options.userIdentity+sessionId,
                "aud": "",
                "isAnonymous": true
            };
            $.ajax({
                url: options.JWTUrl,
                type: 'post',
                data: jsonData,
                dataType: 'json',
                success: function (data) {
                    options.assertion = data.jwt;
                    options.handleError = koreBot.showError;
                    options.chatHistory = koreBot.chatHistory;
                    options.botDetails = koreBot.botDetails;
                    callback(null, options);
                    setTimeout(function () {
                        if (koreBot && koreBot.initToken) {
                            koreBot.initToken(options);
                        }
                    }, 2000);
                },
                error: function (err) {
                    koreBot.showError(err.responseText);
                }
            });
        }
        function getBrandingInformation(options) {
             console.log("In function getBrandingInformation in koremain.js");
            if (chatConfig.botOptions && chatConfig.botOptions.enableThemes) {
                var brandingAPIUrl = (chatConfig.botOptions.brandingAPIUrl || '').replace(':appId', chatConfig.botOptions.botInfo._id);
                $.ajax({
                    url: brandingAPIUrl,
                    headers: {
                        'Authorization': "bearer " + options.authorization.accessToken,
                    },
                    type: 'get',
                    dataType: 'json',
                    success: function (data) {
                        if(koreBot && koreBot.applySDKBranding) {
                            koreBot.applySDKBranding(data);
                        }
                        if (koreBot && koreBot.initToken) {
                            koreBot.initToken(options);
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            }

        }
        function onJWTGrantSuccess(options){
             console.log("In function onJWTGrantSuccess in koremain.js");
            getBrandingInformation(options);
        }
        var chatConfig=window.KoreSDK.chatConfig;
        chatConfig.botOptions.assertionFn=assertion;
        chatConfig.botOptions.jwtgrantSuccessCB = onJWTGrantSuccess;
        var koreBot = koreBotChat();
        koreBot.show(chatConfig);
        $('.openChatWindow').click(function () {
            koreBot.show(chatConfig);
        });
    });

})(jQuery || (window.KoreSDK && window.KoreSDK.dependencies && window.KoreSDK.dependencies.jQuery));
