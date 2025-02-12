(function (window) {
    console.log("Initializing Azure TTS...");
    var audioStatus = 'idle';
    var speechConfig;
    var synthesizer;
    var player;
    var isPlaying = false;
    var audioMessages = [];
    var audioContext;
    var audioStream;
    var bufferSource;
    window.audioPlaying = false;
    window.audioMsgs = []; // Ensuring global access
    let hasMicPermission = false; // RMM Pallavi

    // RMM Pallavi Detect if the device is iOS
     function isIOS() {
        var iosvar = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        console.log("iosvar", iosvar);
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    // RMM Pallavi Detect if the device is iOS

    // Initialize Azure TTS
    function initAzureTTS() {
        console.log("In initAzureTTS");
        if (!window.KoreSDK?.chatConfig?.azureTTS?.key) {
            console.error("Azure TTS: API key is required");
            return;
        }

        try {
            this.hasMicPermission = false; //RMM pallavi: Add condition here to turn on 
            speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
                window.KoreSDK.chatConfig.azureTTS.key,
                window.KoreSDK.chatConfig.azureTTS.region || 'centralindia'
            );

            // ✅ Set voice explicitly
            // speechConfig.speechSynthesisVoiceName = "en-US-DavisNeural"; //pallavi new
            speechConfig.speechSynthesisVoiceName = "en-US-EmmaNeural"; //pallavi new

            audioContext = new AudioContext();
            // player = new SpeechSDK.SpeakerAudioDestination();
            // var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

            audioStream = SpeechSDK.PullAudioOutputStream.create();
            var audioConfig  = AudioConfig.fromStreamOutput(audioStream);

            synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

            console.log("Azure TTS initialized successfully.");
        } catch (error) {
            console.error("Azure TTS initialization failed:", error);
        }
    }

    // RMM Pallavi
    function requestMicrophonePermission() {
        if (hasMicPermission) {
            console.log("Microphone permission already granted.");
            return; // Avoid unnecessary re-prompt
        }
    
        if (isIOS()) {
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

    // pallavi new
    function listAllAvailableVoices() {
        console.log("🔎 Fetching available voices...");
        if (!synthesizer) {
            console.error("❌ Synthesizer not initialized.");
            return;
        }
        
        synthesizer.getVoicesAsync().then((result) => {
            console.log("🟢 Voice fetch API called.");
            if (result && result.voices.length > 0) {
                console.log(`✅ Found ${result.voices.length} voices.`);
                
                // Store all voices in an array
                let voicesArray = result.voices.map(voice => ({
                    name: voice.name,
                    locale: voice.locale,
                    gender: voice.gender
                }));

                let voicesArray2 = result.voices
                    .filter(voice => ["en-IN", "en-GB", "en-US"].includes(voice.locale))
                    .map(voice => ({
                        name: voice.name,
                        locale: voice.locale,
                        gender: voice.gender
                    }));
                
                // Print all voices in one go
                console.log("Available Voices:", voicesArray);
                console.log("Available Voices en-IN, en-GB, and en-US:", voicesArray2);
                console.log("Current voice set in config new:", speechConfig.speechSynthesisVoiceName); // pallavi new
            } else {
                console.error("⚠️ No voices found.");
            }
        }).catch(error => {
            console.error("❌ Error fetching voices:", error);
        });
    }
    // pallavi new

    function speakMsgs() {
        //pallavi new
        var manual = false;
        console.log("msgData", msgData);
        // listAllAvailableVoices();  //pallavi new for now commented
        let firsttextt = msgData.message[0].cInfo.body;
        console.log("firsttext", firsttextt);
        // Check if `template_type` exists and matches the ones where mic should be off
        let payload = msgData.message[0].component?.payload;
        console.log("payload", payload);
        let templateType = payload?.template_type ?? null;
        console.log("templateType", templateType);
        console.log("window.formvalue", window.formvalue); //pallavi form
    
        let disableMicTemplates = [
            "dropdown_template",
            "multi_select",
            "carousel",
            "countryDropdownTemplate",
            "insuranceTemplate",
            "dateTemplate",
            "healthAddonTemplate",
            "checkBoxesTemplate"
        ];
        // micccc
        if (firsttextt.includes("You're verified")) {
            manual = true;
            console.log("Mic will remain OFF because the message contains 'You're verified'");
        }
        // miccccc
        // pallavi form
        if (disableMicTemplates.includes(templateType) || window.formvalue) {
            manual = true;
            console.log("Mic will remain OFF due to template type:", templateType);
        }
    
        //pallavi new

        console.log("In function speakMsgs");
        isPlaying = true;
        console.log("In audiomsgs", audioMessages);
        synthesizer.speakTextAsync(
            audioMessages.shift(),
            result => {
                console.log("In function speechSynthesisVoice",speechConfig.speechSynthesisVoice);
                console.log("In function speakTextAsync");
                if (result) {
                    console.log("In if result");
                    console.log("Speech synthesis succeeded for audiomessages:", audioMessages);
                    audioStatus = 'idle';
                    
                }
                audioContext.decodeAudioData(result.audioData, (buffer) => {
                    bufferSource = audioContext.createBufferSource();
                    console.log("bufferSource", bufferSource);
                    bufferSource.buffer = buffer;
                    bufferSource.connect(audioContext.destination);
                    bufferSource.start(0);
                    bufferSource.onended = () => {
                        if (audioMessages.length > 0) {
                            console.log("Hitting speakmsg in audiomsgs.length");
                            speakMsgs();
                        } else if(isPlaying && !manual) {
                            isPlaying = false;
                            console.log("TTS finished, activating STT..."); //pallavi-mic
                            window.recognizeSpeechWithAzure(); //pallavi-mic
                        }
                        isPlaying = false; // pallavi form NOT CONFIRMED
                        //pallavi-mic
                        // if(isPlaying = false){
                        //     console.log("TTS finished, activating STT..."); 
                        //     window.recognizeSpeechWithAzure();
                        // }
                        //pallavi-mic
                    }
                })
            },
            error => {
                console.error("Speech synthesis failed:", error);
                audioStatus = 'idle';
            }
        );
    }

    // Speak text using Azure TTS
    window.speakTextWithAzure = function (textToSpeak) {
        // RMM Pallavi Request only if not granted
        if (!hasMicPermission && isIOS()) {
            requestMicrophonePermission(); 
        }
        // RMM Pallavi Request only if not granted
        console.log("In window.speakTextWithAzure textToSpeak", textToSpeak);
        audioMessages.push(textToSpeak);
        console.log("audioMessages after pushing", audioMessages);

        if (!isPlaying) {

            console.warn('\n\n\n ---------------speakTextWithAzure-------', textToSpeak)

            // player = new SpeechSDK.SpeakerAudioDestination();
            audioContext = new AudioContext();
            console.log("audioContext", audioContext);
            // player = new SpeechSDK.SpeakerAudioDestination();
            // var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

            audioStream = SpeechSDK.PullAudioOutputStream.create();
            console.log("audioStream", audioStream);
            var audioConfig  = SpeechSDK.AudioConfig.fromStreamOutput(audioStream);
            console.log("audioConfig", audioConfig);
            // var audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
            synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
            console.log("synthesizer", synthesizer);

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

    };

    // Stop speaking function
    window.stopSpeakingAzureTTS = function () {
        // // RMM Pallavi Request only if not granted
        // if (!hasMicPermission && isIOS()) {
        //     requestMicrophonePermission(); 
        // }
        // // RMM Pallavi Request only if not granted
        console.log("In window.stopSpeakingAzureTTS");
        console.warn('\n\n\n ---------------stopSpeakingAzureTTS-------')
        if (isPlaying) {
            // player.pause();
            audioStatus = 'idle';
            console.log("Speech stopped.");
            audioMessages = [];
            isPlaying = false;
            bufferSource.stop();
        } else {
        //     console.warn("Player is not initialized. Cannot stop speech.");
        }
    };
    console.log("Hitting initAzureTTS");
    initAzureTTS();
})(window);
