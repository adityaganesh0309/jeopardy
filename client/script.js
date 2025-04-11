document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById('startButton');
    const timer = document.getElementById('timer');
    const timeRemaining = document.getElementById('timeRemaining');
    const submissionsContainer = document.getElementById('submissions');
    
    const backgroundMusic = document.getElementById('backgroundMusic');
    const alarmSound = document.getElementById('alarmSound');
    
    let timerInterval;
    let isTimerActive = false;  // Track whether the timer is active
    let bubblesCreated = 0; // Keep track of bubbles created
    
    // Connect to the WebSocket server
    const socket = new WebSocket('ws://localhost:3000'); // Make sure the URL matches your backend
  
    // When WebSocket is opened, log a message
    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };
  
    // Handle incoming data from WebSocket
    socket.onmessage = (event) => {
      if (isTimerActive) {  // Only process messages when the timer is active
        const submission = JSON.parse(event.data); // Parse the incoming data
        showSubmission(submission.name, submission.answer);
      }
    };
  
    // Handle WebSocket errors
    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  
    // When the "Start" button is clicked
    startButton.addEventListener('click', () => {
      // Hide the start button
      startButton.style.display = 'none';
      
      // Show the timer and start countdown
      timer.classList.remove('hidden');
      
      let timeLeft = 35;
      timeRemaining.textContent = timeLeft;
      isTimerActive = true;  // Timer is now active
      
      // Play background music
      backgroundMusic.play();
      
      // Start countdown
      timerInterval = setInterval(() => {
        timeLeft--;
        timeRemaining.textContent = timeLeft;
        
        // When the timer reaches 0
        if (timeLeft === 0) {
          clearInterval(timerInterval);
          // After the timer ends, stop accepting submissions
          isTimerActive = false;  // Timer is no longer active
          
          // Stop the music and show the alarm sound
          backgroundMusic.pause();
          alarmSound.play();
          
          // Hide the timer and submissions container
          timer.classList.add('hidden');
          submissionsContainer.classList.add('hidden');
        }
      }, 1000);
      
      // Show the submissions container
      submissionsContainer.classList.remove('hidden');
      
      // Fetch the current submissions from the server
      fetchSubmissions();
    });
  
    // Fetch submissions from the server and display them
    function fetchSubmissions() {
      fetch('http://localhost:3000/view-submissions') // Replace with your actual server endpoint if needed
        .then(response => response.json()) // Parse JSON response
        .then(submissions => {
          // Clear previous submissions (if any)
          submissionsContainer.innerHTML = '';
          
          // Loop through each submission and display it
          submissions.submissions.forEach((submission, index) => {
            showSubmission(submission.name, submission.answer, index + 1);
          });
        })
        .catch(error => {
          console.error('Error fetching submissions:', error);
        });
    }
  
    // Function to display a submission bubble
    function showSubmission(name, answer, position) {
      // Limit the number of bubbles
      if (bubblesCreated < 4) {
        const submissionElement = document.createElement('div');
        submissionElement.classList.add('submission');
        submissionElement.classList.add(`position${position}`);
        submissionElement.textContent = name; // Show only the name initially
        
        // Play the bubble sound when the bubble appears
        playBubbleSound();
        
        // Add event listener to toggle between name and answer
        submissionElement.addEventListener('click', () => {
          if (submissionElement.classList.contains('clicked')) {
            // Remove the bubble (pop it)
            submissionElement.remove();
            bubblesCreated--;
          } else {
            // Toggle answer visibility
            submissionElement.textContent = `${name}: ${answer}`;
            submissionElement.classList.add('clicked');
          }
        });
  
        // Append the bubble to the container
        submissionsContainer.appendChild(submissionElement);
        bubblesCreated++;
      }
    }

    // Function to play the bubble sound
    function playBubbleSound() {
      const bubbleSound = new Audio('bubble_sound.mp3'); // Replace with your actual bubble sound file path
      bubbleSound.play();
    }
  });