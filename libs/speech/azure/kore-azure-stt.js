(function(window, $) {
    console.log(" In window function");
    // Initialize required variables
    var audioStatus = 'idle';
    var speechConfig;
    var synthesizer;
    var player;
    var speechRecognizer;
    let hasMicPermission = false; // RMM Pallavi

    // RMM Pallavi Detect if the device is iOS
     function isIOS() {
        var iosvar = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        console.log("iosvar", iosvar);
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    // RMM Pallavi Detect if the device is iOS
    

    // Initialize Azure STT
    function initAzureSTT() {
        this.hasMicPermission = false; //RMM pallavi
        console.log(" In initAzureSTT");
        if (!window.KoreSDK.chatConfig.stt.azure.subscriptionKey) {
            console.error("Azure STT: API key is required");
            return;
        }
    }

    // RMM Pallavi
    function requestMicrophonePermission() {
        if (hasMicPermission) {
            console.log("Microphone permission already granted.");
            return; // Avoid unnecessary re-prompt
        }
    
        if (isIOS() && !hasMicPermission) {
            alert("Microphone permission is required. Please enable it in Settings > Safari > Microphone.");
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    stream.getTracks().forEach(track => track.stop());
                    hasMicPermission = true; 
                    console.log("Microphone permission granted.");
                    updateUI();
                })
                .catch(error => {
                    console.error('Microphone permission denied:', error);
                    alert('Microphone permission is required for this feature.');
                });
        }
    }
    // RMM Pallavi

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
        // RMM Pallavi Request only if not granted
        if (!hasMicPermission && isIOS()) {
            requestMicrophonePermission(); 
        }
        // RMM Pallavi Request only if not granted
        console.log("In window.recognizeSpeechWithAzure");
    
        try {

            //pallavi-mic
            if (window.currentSpeechRecognizer) {
                console.log("Stopping existing recognizer before starting a new one...");
                window.currentSpeechRecognizer.stopContinuousRecognitionAsync(() => {
                    console.log("Previous Speech Recognizer Stopped.");
                    window.currentSpeechRecognizer = null;
                }); 
            }
            //pallavi-mic
            // Initialize Azure Speech SDK with subscription key and region
            var sttConfig = SpeechSDK.SpeechConfig.fromSubscription(
                window.KoreSDK.chatConfig.stt.azure.subscriptionKey,
                'centralindia' // Replace with your region
            );
            sttConfig.speechRecognitionLanguage = 'en-US'; // Set default language
    
            // Create a speech recognizer with the microphone input
            var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
            var speechRecognizer = new SpeechSDK.SpeechRecognizer(sttConfig, audioConfig);
            
            //pallavi-mic
            window.currentSpeechRecognizer = speechRecognizer;
            //pallavi-mic
            console.log("Azure STT initialized successfully");
    
            // Flags and variables
            let finalTranscript = '';
            let inputSent = false;  // Prevent multiple sends
            let speechEndTimer = null; // Timer for handling speech end
            const SPEECH_END_DELAY = 1500; // Delay to detect speech end
    
            //pallavi-mic
            // Show recording microphone icon
            // console.log("Mic ON: Session Started");
            // $('.recordingMicrophone').css('display', 'block');
            // $('.notRecordingMicrophone').css('display', 'none');
            //pallavi-mic

            // Start continuous speech recognition
            speechRecognizer.startContinuousRecognitionAsync(
                () => console.log("Azure Speech Recognition Started"),
                (err) => console.error("Error Starting Recognition:", err)
            );

            //pallavi-mic
            console.log("Mic ON: Session Started");
            $('.recordingMicrophone').css('display', 'block');
            $('.notRecordingMicrophone').css('display', 'none');
            //pallavi-mic
    
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
                            document.querySelector('.chatInputBox').innerHTML = ""; // pallavi micccc pallu 2

                            // Reset variables
                            finalTranscript = '';
                            inputSent = true; // Mark the input as sent
                            
                            //pallavi-mic commented -> speechRecognizer.stopContinuousRecognitionAsync(); // Stop recognition after sending
                            
                            //pallavi-mic
                            speechRecognizer.stopContinuousRecognitionAsync(() => {
                                console.log("Speech Recognizer Stopped.");
                                window.currentSpeechRecognizer = null;
                            });
                            //pallavi-mic
                        }
                    }, SPEECH_END_DELAY);
                }
            };
    
            // Handle cancellation and errors
            speechRecognizer.canceled = function(s, e) {
                console.error("Recognition Canceled:", e.reason);
                let text = "Cancelled: " + e.reason;
                console.log("Mic OFF: Session Stopped");
                $('.recordingMicrophone').css('display', 'none');
                $('.notRecordingMicrophone').css('display', 'block');
                document.querySelector('.chatInputBox').innerHTML = ""; // pallavi micccc
                if (e.reason === SpeechSDK.CancellationReason.Error) {
                    text = "Error: " + e.errorDetails;
                }
                console.warn(text);
            };
    
            // Handle session stopped
            speechRecognizer.sessionStopped = function() {
                console.log("Recognition Session Stopped");
                console.log("Mic OFF: Session Stopped");
                $('.recordingMicrophone').css('display', 'none');
                $('.notRecordingMicrophone').css('display', 'block');
                speechRecognizer.stopContinuousRecognitionAsync();
                window.currentSpeechRecognizer = null; // pallavi-mic
                document.querySelector('.chatInputBox').innerHTML = ""; // pallavi micccc
            };
    
        } catch (error) {
            console.error("Azure STT initialization failed:", error);
        }
    };
    

    // Initialize when the script loads
    initAzureSTT();

})(window, (jQuery || (window.KoreSDK && window.KoreSDK.dependencies && window.KoreSDK.dependencies.jQuery)));
// pallavi-azure


