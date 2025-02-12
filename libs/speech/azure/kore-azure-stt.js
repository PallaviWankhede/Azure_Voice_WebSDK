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


// TTS
// // already working
// (function (window) {
//     console.log("Initializing Azure TTS...");
//     var audioStatus = 'idle';
//     var speechConfig;
//     var synthesizer;
//     var player;
//     var isPlaying = false;
//     var audioMessages = []; 
//     var audioContext;
//     var audioStream;
//     var bufferSource;
//     window.audioPlaying = false;
//     window.audioMsgs = []; // Ensuring global access

//     // Initialize Azure TTS
//     function initAzureTTS() {
//         console.log("In initAzureTTS");
         if (!window.KoreSDK?.chatConfig?.azureTTS?.key) {
             console.error("Azure TTS: API key is required");
//             return;
//         }

//         try {
//             speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
//                 window.KoreSDK.chatConfig.azureTTS.key,
//                 window.KoreSDK.chatConfig.azureTTS.region || 'centralindia'
//             );

//             // ✅ Set voice explicitly
//             // speechConfig.speechSynthesisVoiceName = "en-US-DavisNeural"; //pallavi new
//             // speechConfig.speechSynthesisVoiceName = "en-US-JennyMultilingualNeural"; //pallavi new
//             speechConfig.speechSynthesisVoiceName = "en-US-EmmaNeural"; //pallavi new

//             audioContext = new AudioContext();
//             // player = new SpeechSDK.SpeakerAudioDestination();
//             // var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

//             audioStream = SpeechSDK.PullAudioOutputStream.create();
//             var audioConfig  = AudioConfig.fromStreamOutput(audioStream);

//             synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

//             console.log("Azure TTS initialized successfully.");
//             // Fetch and print all available voices
//             // listAllAvailableVoices();
//         } catch (error) {
//             console.error("Azure TTS initialization failed:", error);
//         }
//     }
//     // pallavi new
//     function listAllAvailableVoices() {
//         console.log("🔎 Fetching available voices...");
//         if (!synthesizer) {
//             console.error("❌ Synthesizer not initialized.");
//             return;
//         }
        
//         synthesizer.getVoicesAsync().then((result) => {
//             console.log("🟢 Voice fetch API called.");
//             if (result && result.voices.length > 0) {
//                 console.log(`✅ Found ${result.voices.length} voices.`);
                
//                 // Store all voices in an array
//                 let voicesArray = result.voices.map(voice => ({
//                     name: voice.name,
//                     locale: voice.locale,
//                     gender: voice.gender
//                 }));

//                 let voicesArray2 = result.voices
//                     .filter(voice => ["en-IN", "en-GB", "en-US"].includes(voice.locale))
//                     .map(voice => ({
//                         name: voice.name,
//                         locale: voice.locale,
//                         gender: voice.gender
//                     }));
                
//                 // Print all voices in one go
//                 console.log("Available Voices:", voicesArray);
//                 console.log("Available Voices en-IN, en-GB, and en-US:", voicesArray2);
//                 console.log("Current voice set in config new:", speechConfig.speechSynthesisVoiceName); // pallavi new
//             } else {
//                 console.error("⚠️ No voices found.");
//             }
//         }).catch(error => {
//             console.error("❌ Error fetching voices:", error);
//         });
//     }
    
//     // pallavi new

//     function speakMsgs() {
//         //pallavi new
//         var manual = false;
//         console.log("msgData", msgData);
//         listAllAvailableVoices();  //pallavi new
//         let firsttextt = msgData.message[0].cInfo.body;
//         console.log("firsttext", firsttextt);
//         // Check if `template_type` exists and matches the ones where mic should be off
//         let payload = msgData.message[0].component?.payload;
//         console.log("payload", payload);
//         let templateType = payload?.template_type ?? null;
//         console.log("templateType", templateType);
//         console.log("window.formvalue", window.formvalue); //pallavi form
//         // pallavi miccc
//         let disableMicTemplates = [
//             "dropdown_template",
//             "multi_select",
//             "carousel",
//             "countryDropdownTemplate",
//             "insuranceTemplate",
//             "dateTemplate",
//             "healthAddonTemplate",
//             "checkBoxesTemplate"
//         ];
//         if (firsttextt.includes("You're verified") || firsttextt.includes("Please wait for a some time.") ) {
//             manual = true;
//             console.log("Mic will remain OFF because the message contains 'You're verified'");
//         }
//         // pallavi miccc
    
//         if (disableMicTemplates.includes(templateType) || window.formvalue) {
//             manual = true;
//             console.log("Mic will remain OFF due to template type:", templateType);
//         }
    
//         //pallavi new

//         console.log("In function speakMsgs");
//         isPlaying = true;
//         console.log("In audiomsgs", audioMessages);
//         synthesizer.speakTextAsync(
//             audioMessages.shift(),
//             result => {
//                 console.log("In function speakTextAsync");
//                 if (result) {
//                     console.log("In if result");
//                     console.log("Speech synthesis succeeded for audiomessages:", audioMessages);
//                     audioStatus = 'idle';
//                     //pallavi new
//                     // synthesizer.getVoicesAsync((voiceResult) => {
//                     //     if (voiceResult && voiceResult.voices.length > 0) {
//                     //         let currentVoice = voiceResult.voices.find(voice => voice.name === result.properties.get(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult));
//                     //         console.log(`🔄 Current voice playing: ${currentVoice ? currentVoice.name : "Unknown"}`);
//                     //     } else {
//                     //         console.log("⚠️ Could not detect the current voice.");
//                     //     }
//                     // });
//                     //pallavi new
                    
//                 }
//                 audioContext.decodeAudioData(result.audioData, (buffer) => {
//                     bufferSource = audioContext.createBufferSource();
//                     console.log("bufferSource", bufferSource);
//                     bufferSource.buffer = buffer;
//                     bufferSource.connect(audioContext.destination);
//                     bufferSource.start(0);
//                     bufferSource.onended = () => {
//                         if (audioMessages.length > 0) {
//                             console.log("Hitting speakmsg in audiomsgs.length");
//                             speakMsgs();
//                         } else if(isPlaying && !manual) {
//                             isPlaying = false;
//                             console.log("TTS finished, activating STT..."); //pallavi-mic
//                             window.recognizeSpeechWithAzure(); //pallavi-mic
//                         }
//                         // isPlaying = false; // pallavi form
//                         //pallavi-mic
//                         // if(isPlaying = false){
//                         //     console.log("TTS finished, activating STT..."); 
//                         //     window.recognizeSpeechWithAzure();
//                         // }
//                         //pallavi-mic
//                     }
//                 })
//             },
//             error => {
//                 console.error("Speech synthesis failed:", error);
//                 audioStatus = 'idle';
//             }
//         );
//     }

//     // Speak text using Azure TTS
//     window.speakTextWithAzure = function (textToSpeak) {
//         // document.querySelector('.chatInputBox').innerHTML = ""; // pallavi micccc
//         console.log("In window.speakTextWithAzure textToSpeak", textToSpeak);
//         audioMessages.push(textToSpeak);
//         console.log("audioMessages after pushing", audioMessages);

//         if (!isPlaying) {

//             console.warn('\n\n\n ---------------speakTextWithAzure-------', textToSpeak)

//             // player = new SpeechSDK.SpeakerAudioDestination();
//             audioContext = new AudioContext();
//             console.log("audioContext", audioContext);
//             // player = new SpeechSDK.SpeakerAudioDestination();
//             // var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

//             audioStream = SpeechSDK.PullAudioOutputStream.create();
//             console.log("audioStream", audioStream);
//             var audioConfig  = SpeechSDK.AudioConfig.fromStreamOutput(audioStream);
//             console.log("audioConfig", audioConfig);
//             // var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
//             synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
//             console.log("synthesizer", synthesizer);

//             if (!synthesizer) {
//                 console.error("Azure TTS not initialized");
//                 return;
//             }

//             if (audioStatus === 'speaking') {
//                 console.log("Already speaking, waiting for current speech to finish.");
//                 return;
//             }

//             audioStatus = 'speaking';
//             speakMsgs();
//         }


//         // synthesizer.synthesisCompleted = function () {
//         //     console.log("\n\n\n\n\n----------------------------------Speech synthesis completed.", window.audioMsgs, window.audioPlaying);
//         //     window.audioPlaying = false;
//         //     audioStatus = 'idle'
//         //     // Remove the first message after playing
//         //     window.audioMsgs.shift();

//         //     // Play next message if available
//         //     if (window.audioMsgs.length > 0 && !window.audioPlaying) {
//         //         playMessageSequence();
//         //     }
//         // };
//     };

//     // Stop speaking function
//     window.stopSpeakingAzureTTS = function () {
//         console.log("In window.stopSpeakingAzureTTS");
//         console.warn('\n\n\n ---------------stopSpeakingAzureTTS-------')
//         if (isPlaying) {
//             // player.pause();
//             audioStatus = 'idle';
//             console.log("Speech stopped.");
//             audioMessages = [];
//             isPlaying = false;
//             bufferSource.stop();
//         } else {
//         //     console.warn("Player is not initialized. Cannot stop speech.");
//         }
//     };
//     console.log("Hitting initAzureTTS");
//     initAzureTTS();

// })(window);
// // ritesh-azure
// // already working

