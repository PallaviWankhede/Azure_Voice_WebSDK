(function(window, $) {
    console.log(" In window function");
    // Initialize required variables
    var audioStatus = 'idle';
    var speechConfig;
    var synthesizer;
    var player;
    var speechRecognizer;
    

    // Initialize Azure STT
    function initAzureSTT() {
        console.log(" In initAzureSTT");
        if (!window.KoreSDK.chatConfig.stt.azure.subscriptionKey) {
            console.error("Azure STT: API key is required");
            return;
        }
    }

    // Stop speaking
    window.stopSpeakingAzureSTT = function() {
        console.log("In window stopSpeakingAzureSTT");
        $('.notRecordingMicrophone').css('display', 'block');
        $('.recordingMicrophone').css('display', 'none');
        // speechRecognizer.close();
        if (speechRecognizer && typeof speechRecognizer.close === "function") {
            speechRecognizer.close();
            console.log("speechRecognizer successfully closed.");
        } else {
            console.error("speechRecognizer is undefined or does not have a 'close' method.");
        }
    };

    // Speech-to-Text function
    // window.recognizeSpeechWithAzure = function() {
    //     console.log(" In window.recognizeSpeechWithAzure");

    //     try {
    //         var sttConfig = SpeechSDK.SpeechConfig.fromSubscription(
    //             window.KoreSDK.chatConfig.stt.azure.subscriptionKey,
    //             'centralindia'    
    //         );
    //         sttConfig.speechRecognitionLanguage = 'en-US'; // Set default language

    //         // var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    //         speechRecognizer = new SpeechSDK.SpeechRecognizer(sttConfig);

    //         console.log("Azure STT initialized successfully");
    //     } catch (error) {
    //         console.error("Azure STT initialization failed:", error);
    //     }

    //     speechRecognizer.recognizeOnceAsync(result => {
    //         console.log(" In speechRecognizer recognizeOnceAsync");
    //         let text = "";
    //         switch (result.reason) {
    //             case SpeechSDK.ResultReason.RecognizedSpeech:
    //                 text = result.text;
                    
    //                 document.querySelector('.chatInputBox').innerHTML = text;
    //                 console.log("Recognized: " + text);
    //                 break;
    //             case SpeechSDK.ResultReason.NoMatch:
    //                 text = "Speech could not be recognized.";
    //                 $('.recordingMicrophone').css('display', 'none');
    //                 $('.notRecordingMicrophone').css('display', 'block');
    //                 console.warn(text);
    //                 break;
    //             case SpeechSDK.ResultReason.Canceled:
    //                 var cancellation = SpeechSDK.CancellationDetails.fromResult(result);
    //                 text = "Cancelled: Reason= " + cancellation.reason;
    //                 $('.recordingMicrophone').css('display', 'none');
    //                 $('.notRecordingMicrophone').css('display', 'block');
    //                 if (cancellation.reason == SpeechSDK.CancellationReason.Error) {
    //                     text = "Canceled: " + cancellation.errorDetails;
    //                 }
    //                 console.warn(text);
    //                 break;
    //         }
    //     });
    // };

    // pallavi-azure
    window.recognizeSpeechWithAzure = function() {
        console.log("In window.recognizeSpeechWithAzure");
    
        try {
            // Initialize Azure Speech SDK with subscription key and region
            var sttConfig = SpeechSDK.SpeechConfig.fromSubscription(
                window.KoreSDK.chatConfig.stt.azure.subscriptionKey,
                'centralindia' // Replace with your region
            );
            sttConfig.speechRecognitionLanguage = 'en-US'; // Set default language
    
            // Create a speech recognizer with the microphone input
            var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            var speechRecognizer = new SpeechSDK.SpeechRecognizer(sttConfig, audioConfig);
    
            console.log("Azure STT initialized successfully");
    
            // Flags and variables
            let finalTranscript = '';
            let inputSent = false;  // Prevent multiple sends
            let speechEndTimer = null; // Timer for handling speech end
            const SPEECH_END_DELAY = 1500; // Delay to detect speech end
    
            // Show recording microphone icon
            $('.recordingMicrophone').css('display', 'block');
            $('.notRecordingMicrophone').css('display', 'none');
    
            // Start continuous speech recognition
            speechRecognizer.startContinuousRecognitionAsync(
                () => console.log("Azure Speech Recognition Started"),
                (err) => console.error("Error Starting Recognition:", err)
            );
    
            // Process interim results (when recognition is ongoing)
            speechRecognizer.recognizing = function(s, e) {
                console.log("Recognizing: ", e.result.text);
                finalTranscript = e.result.text;
    
                // Display interim results in the chat input box
                document.querySelector('.chatInputBox').innerHTML = finalTranscript;
            };
    
            // Process final recognized speech
            speechRecognizer.recognized = function(s, e) {
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    finalTranscript = e.result.text;
                    document.querySelector('.chatInputBox').innerHTML = finalTranscript;
                    console.log("Recognized: " + finalTranscript);
    
                    // Clear previous speechEndTimer
                    if (speechEndTimer) clearTimeout(speechEndTimer);
    
                    // Start a timer to send the final transcript after speech ends
                    speechEndTimer = setTimeout(function () {
                        if (!inputSent) {
                            console.log("Sending final transcript: ", finalTranscript);
    
                            // Send the recognized message
                            const me = window.chatContainerConfig;
                            me.sendMessage($('.chatInputBox')); // Send the message
    
                            // Reset variables
                            finalTranscript = '';
                            inputSent = true; // Mark the input as sent
                            speechRecognizer.stopContinuousRecognitionAsync(); // Stop recognition after sending
                        }
                    }, SPEECH_END_DELAY);
                }
            };
    
            // Handle cancellation and errors
            speechRecognizer.canceled = function(s, e) {
                console.error("Recognition Canceled:", e.reason);
                let text = "Cancelled: " + e.reason;
                $('.recordingMicrophone').css('display', 'none');
                $('.notRecordingMicrophone').css('display', 'block');
                if (e.reason === SpeechSDK.CancellationReason.Error) {
                    text = "Error: " + e.errorDetails;
                }
                console.warn(text);
            };
    
            // Handle session stopped
            speechRecognizer.sessionStopped = function() {
                console.log("Recognition Session Stopped");
                $('.recordingMicrophone').css('display', 'none');
                $('.notRecordingMicrophone').css('display', 'block');
                speechRecognizer.stopContinuousRecognitionAsync();
            };
    
        } catch (error) {
            console.error("Azure STT initialization failed:", error);
        }
    };
    

    // Initialize when the script loads
    initAzureSTT();

})(window, (jQuery || (window.KoreSDK && window.KoreSDK.dependencies && window.KoreSDK.dependencies.jQuery)));
// pallavi-azure