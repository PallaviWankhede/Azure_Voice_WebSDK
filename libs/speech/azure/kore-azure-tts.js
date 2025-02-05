// (function(window) {
//     console.log(" In window function");
//     // Initialize required variables
//     var audioStatus = 'idle';
//     var speechConfig;
//     var synthesizer;
//     var player;

//     // Initialize Azure TTS
//     function initAzureTTS() {
//         console.log(" In initAzureTTS function");
//         if (!window.KoreSDK.chatConfig.azureTTS || !window.KoreSDK.chatConfig.azureTTS.key) {
//             console.error("Azure TTS: API key is required");
//             return;
//         }

//         try {
//             // Configure Azure TTS subscription
//             speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
//                 window.KoreSDK.chatConfig.azureTTS.key, 
//                 window.KoreSDK.chatConfig.azureTTS.region || '*****'   
//             );

//             console.log('----------speechConfig-------', window.KoreSDK);

//             // Create audio player
//             player = new SpeechSDK.SpeakerAudioDestination();
//             var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

//             // Create synthesizer linked to audio player
//             synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

//             console.log("Azure TTS initialized successfully");
//         } catch (error) {
//             console.error("Azure TTS initialization failed:", error);
//         }
//     }

//     // Main speak function
//     window.speakTextWithAzure = function(textToSpeak) {
//         console.log(" In speakTextWithAzure function");
//         if (!synthesizer) {
//             console.error("Azure TTS not initialized");
//             return;
//         }

//         if (audioStatus === 'speaking' && player) {
//             console.log("speaking status");
//             player.pause();
//         }
//         // Reset Player to prevent playback issues
//         player = new SpeechSDK.SpeakerAudioDestination();
//         var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
//         synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
        
//         audioStatus = 'speaking';
//         synthesizer.speakTextAsync(
//             textToSpeak,
//             result => {
//                 if (result) {
//                     audioStatus = 'idle';
//                     console.log("Speech synthesis succeeded");
//                 }
//             },
//             error => {
//                 audioStatus = 'idle';
//                 console.error("Speech synthesis failed:", error);
//             }
//         );
//     };

//        // Optional: This function can be called to handle multiple messages in a sequence
//        window.speakTextWithAzure.onSpeechSynthesisComplete = function() {
//         console.log("Speech synthesis complete, checking if there are more messages");
    
//         // Check if there are more messages to play
//         if (audioMsgs.length > 0 && !audioPlaying) {
//             audioPlaying = true;
//             const nextMessage = audioMsgs.shift(); // Get the next message
//             window.speakTextWithAzure(nextMessage); // Play the next message
//         } else {
//             console.log("No more messages to speak");
//         }
//     };

//     // Stop speaking
//     window.stopSpeakingAzureTTS = function() {
//         console.log(" In stopSpeakingAzureTTS function");
//         if (player) {
//             player.pause();
//             audioStatus = 'idle';
//             console.log("In stopSpeakingAzureTTS function");
//         } else {
//             console.warn("Player is not initialized. Cannot stop speech.");
//         }
//     };

//     // Initialize when the script loads
//     initAzureTTS();

// })(window);

// pallavi-azure used
// (function(window) {
//     console.log("Initializing Azure TTS...");
//     var audioStatus = 'idle';
//     var speechConfig;
//     var synthesizer;
//     var player;
//     window.audioPlaying = false;
//     window.audioMsgs = []; // Ensuring global access

//     // Initialize Azure TTS
//     function initAzureTTS() {
//         if (!window.KoreSDK?.chatConfig?.azureTTS?.key) {
//             console.error("Azure TTS: API key is required");
//             return;
//         }

//         try {
//             speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
//                 window.KoreSDK.chatConfig.azureTTS.key, 
//                 window.KoreSDK.chatConfig.azureTTS.region || 'centralindia'
//             );

//             player = new SpeechSDK.SpeakerAudioDestination();
//             var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
//             synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

//             console.log("Azure TTS initialized successfully.");
//         } catch (error) {
//             console.error("Azure TTS initialization failed:", error);
//         }
//     }

//     // Speak text using Azure TTS
//     window.speakTextWithAzure = function(textToSpeak) {
//         player = new SpeechSDK.SpeakerAudioDestination();
//         var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
//         synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
//         if (!synthesizer) {
//             console.error("Azure TTS not initialized");
//             return;
//         }

//         if (audioStatus === 'speaking') {
//             console.log("Already speaking, waiting for current speech to finish.");
//             return;
//         }

//         audioStatus = 'speaking';
//         synthesizer.speakTextAsync(
//             textToSpeak,
//             result => {
//                 if (result) {
//                     console.log("Speech synthesis succeeded for:", textToSpeak);
//                     audioStatus = 'idle';
//                 }
//             },
//             error => {
//                 console.error("Speech synthesis failed:", error);
//                 audioStatus = 'idle';
//             }
//         );

//         synthesizer.synthesisCompleted = function () {
//             console.log("Speech synthesis completed.");
//             window.audioPlaying = false;
//             audioStatus = 'idle'
//             // Remove the first message after playing
//             audioMsgs.shift();

//             // Play next message if available
//             if (audioMsgs.length > 0 && !audioPlaying) {
//                 playMessageSequence();
//             }
//         };
//     };

//     // Stop speaking function
//     window.stopSpeakingAzureTTS = function() {
//         if (player) {
//             player.pause();
//             audioStatus = 'idle';
//             console.log("Speech stopped.");
//         } else {
//             console.warn("Player is not initialized. Cannot stop speech.");
//         }
//     };
//     initAzureTTS();

// })(window);
// pallavi-azure used

// ritesh-azure
(function (window) {
    console.log("Initializing Azure TTS...");
    var audioStatus = 'idle';
    var speechConfig;
    var synthesizer;
    var player;
    var isPlaying = false;
    var audioMessages = [];
    window.audioPlaying = false;
    window.audioMsgs = []; // Ensuring global access

    // Initialize Azure TTS
    function initAzureTTS() {
        if (!window.KoreSDK?.chatConfig?.azureTTS?.key) {
            console.error("Azure TTS: API key is required");
            return;
        }

        try {
            speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
                window.KoreSDK.chatConfig.azureTTS.key,
                window.KoreSDK.chatConfig.azureTTS.region || 'centralindia'
            );

            player = new SpeechSDK.SpeakerAudioDestination();
            var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
            synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

            console.log("Azure TTS initialized successfully.");
        } catch (error) {
            console.error("Azure TTS initialization failed:", error);
        }
    }

    function speakMsgs() {
        isPlaying = true;
        synthesizer.speakTextAsync(
            audioMessages.shift(),
            result => {
                if (result) {
                    console.log("Speech synthesis succeeded for:", audioMessages);
                    audioStatus = 'idle';
                    if (audioMessages.length > 0) {
                        speakMsgs();
                    } else {
                        isPlaying = false;
                    }
                }
            },
            error => {
                console.error("Speech synthesis failed:", error);
                audioStatus = 'idle';
            }
        );
    }

    // Speak text using Azure TTS
    window.speakTextWithAzure = function (textToSpeak) {
        audioMessages.push(textToSpeak);


        if (!isPlaying) {
            console.warn('\n\n\n ---------------speakTextWithAzure-------', textToSpeak)

            player = new SpeechSDK.SpeakerAudioDestination();
            var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
            synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
            if (!synthesizer) {
                console.error("Azure TTS not initialized");
                return;
            }

            if (audioStatus === 'speaking') {
                console.log("Already speaking, waiting for current speech to finish.");
                return;
            }

            audioStatus = 'speaking';
            speakMsgs();
        }


        // synthesizer.synthesisCompleted = function () {
        //     console.log("\n\n\n\n\n----------------------------------Speech synthesis completed.", window.audioMsgs, window.audioPlaying);
        //     window.audioPlaying = false;
        //     audioStatus = 'idle'
        //     // Remove the first message after playing
        //     window.audioMsgs.shift();

        //     // Play next message if available
        //     if (window.audioMsgs.length > 0 && !window.audioPlaying) {
        //         playMessageSequence();
        //     }
        // };
    };

    // Stop speaking function
    window.stopSpeakingAzureTTS = function () {
        console.warn('\n\n\n ---------------stopSpeakingAzureTTS-------')
        if (player) {
            player.pause();
            audioStatus = 'idle';
            console.log("Speech stopped.");
            audioMessages = [];
            isPlaying = false;
        } else {
            console.warn("Player is not initialized. Cannot stop speech.");
        }
    };
    initAzureTTS();

})(window);
// ritesh-azure



