// DOM references and state
const loginNav = document.getElementById('login-nav');
const registerNav = document.getElementById('register-nav');
const bookingNav = document.getElementById('booking-nav');
const destinationNav = document.getElementById('destination-nav');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const bookingSection = document.getElementById('booking-section');
const destinationSection = document.getElementById('destination-section');
const eventSelect = document.getElementById('event-select');
const trainModule = document.getElementById('train-booking-module');
const otherEventsMessage = document.getElementById('other-events-message');
const trainListBody = document.querySelector('#train-list tbody');
const noTrainsMsg = document.getElementById('no-trains-msg');
const sourceStationSelect = document.getElementById('source-station');
const destinationStationSelect = document.getElementById('destination-station');
const journeyDateInput = document.getElementById('journey-date');
const coachSelect = document.getElementById('coach-selection');
const passengerContainer = document.getElementById('passenger-container');
const addPassengerBtn = document.getElementById('add-passenger');
const pnrDisplay = document.getElementById('pnr');
const bookingForm = document.getElementById('booking-form');

let loggedIn = false;
let selectedTrain = null;
let passengersCount = 0;

// Sample trains data for demo purposes
const trainsData = [
  {
    name: 'Express 101',
    time: '08:00 AM',
    classes: ['Sleeper', 'AC 3 Tier', 'AC 2 Tier'],
    availability: { Sleeper: 10, 'AC 3 Tier': 5, 'AC 2 Tier': 2 }
  },
  {
    name: 'Local 202',
    time: '12:30 PM',
    classes: ['Sleeper', 'AC 3 Tier'],
    availability: { Sleeper: 0, 'AC 3 Tier': 3 }
  },
  {
    name: 'Superfast 303',
    time: '06:00 PM',
    classes: ['AC 2 Tier', 'AC First Class'],
    availability: { 'AC 2 Tier': 4, 'AC First Class': 1 }
  }
];

// Date setup for date inputs - set minimum to today
function setMinDate(inputElement) {
  const today = new Date().toISOString().split('T')[0];
  inputElement.setAttribute('min', today);
}
setMinDate(journeyDateInput);

// Show/hide sections utility
function showSection(sectionToShow) {
  [loginSection, registerSection, bookingSection].forEach(sec => {
    sec.hidden = sec !== sectionToShow;
  });
  // Update nav buttons active state and aria-selected
  loginNav.classList.toggle('active', sectionToShow === loginSection);
  loginNav.setAttribute('aria-selected', sectionToShow === loginSection);
  registerNav.classList.toggle('active', sectionToShow === registerSection);
  registerNav.setAttribute('aria-selected', sectionToShow === registerSection);
  bookingNav.classList.toggle('active', sectionToShow === bookingSection);
  bookingNav.setAttribute('aria-selected', sectionToShow === bookingSection);
  destinationNav.classList.toggle('active', false);
  destinationNav.setAttribute('aria-selected', false);
}

// Function to show and scroll to register section
function showRegisterSection() {
  showSection(registerSection);
  registerSection.scrollIntoView({ behavior: 'smooth' });
  registerSection.focus();
}

// Function to scroll to destination section
function scrollToDestination() {
  destinationSection.scrollIntoView({ behavior: 'smooth' });
  // Update nav buttons active state
  loginNav.classList.remove('active');
  loginNav.setAttribute('aria-selected', 'false');
  registerNav.classList.remove('active');
  registerNav.setAttribute('aria-selected', 'false');
  bookingNav.classList.remove('active');
  bookingNav.setAttribute('aria-selected', 'false');
  destinationNav.classList.add('active');
  destinationNav.setAttribute('aria-selected', 'true');
}

// Validate email format
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Navigation button events
loginNav.addEventListener('click', () => showSection(loginSection));
registerNav.addEventListener('click', () => showSection(registerSection));
bookingNav.addEventListener('click', () => { if(loggedIn) showSection(bookingSection); });
destinationNav.addEventListener('click', scrollToDestination);

// Login form handler
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = e.target['login-email'].value.trim();
  const pwd = e.target['login-password'].value;
  if(!validateEmail(email) || pwd.length < 6){
    alert('Invalid email or password.');
    return;
  }
  loggedIn = true;
  alert(`Welcome back, ${email}! You are now logged in.`);
  e.target.reset();
  bookingNav.disabled = false;
  showSection(bookingSection);
});

// Register form handler
document.getElementById('register-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = e.target['register-name'].value.trim();
  const email = e.target['register-email'].value.trim();
  const pwd = e.target['register-password'].value;
  const confirm = e.target['register-password-confirm'].value;
  if(name.length<2){
    alert('Please enter a valid full name.');
    return;
  }
  if(!validateEmail(email)){
    alert('Please enter a valid email address.');
    return;
  }
  if(pwd.length<6){
    alert('Password must be at least 6 characters.');
    return;
  }
  if(pwd!==confirm){
    alert('Passwords do not match.');
    return;
  }
  alert(`Registration successful for ${name}. You can now login.`);
  e.target.reset();
  showSection(loginSection);
});

// Event select handler to toggle train booking module for train event
eventSelect.addEventListener('change', () => {
  const evt = eventSelect.value;
  if(evt === 'train'){
    trainModule.style.display = 'block';
    otherEventsMessage.style.display = 'none';
  } else {
    trainModule.style.display = 'none';
    otherEventsMessage.style.display = 'block';
  }
});

// Clear previous train selection/UI
function resetTrainList(){
  trainListBody.innerHTML = '';
  noTrainsMsg.style.display = 'none';
  selectedTrain = null;
  coachSelect.value = '';
  clearPassengers();
  pnrDisplay.style.display = 'none';
}

// Load available trains based on criteria (mock filtering)
function loadAvailableTrains(){
  resetTrainList();
  const source = sourceStationSelect.value;
  const dest = destinationStationSelect.value;
  const date = journeyDateInput.value;
  if(!source || !dest || source === dest || !date){
    return; // Need all valid inputs to load trains
  }
  // For demo, show all trains for valid combination
  const filteredTrains = trainsData.filter(t => {
    // Mock condition: any train is available for all source/dest combos except source=dest
    return true;
  });
  if(filteredTrains.length === 0){
    noTrainsMsg.style.display = 'block';
    return;
  }
  filteredTrains.forEach((train, index) => {
    train.classes.forEach(cls => {
      const avail = train.availability[cls] || 0;
      const tr = document.createElement('tr');
      tr.tabIndex = 0;
      tr.dataset.trainIndex = index;
      tr.dataset.class = cls;
      tr.dataset.availability = avail;
      tr.innerHTML = `
        <td>${train.name}</td>
        <td>${train.time}</td>
        <td>${cls}</td>
        <td>${avail > 0 ? avail : 'Unavailable'}</td>
      `;
      if(avail === 0){
        tr.style.color = '#888';
        tr.style.cursor = 'not-allowed';
        tr.setAttribute('aria-disabled', 'true');
      } else {
        tr.style.cursor = 'pointer';
      }
      trainListBody.appendChild(tr);
    });
  });
}

// Clear passenger inputs
function clearPassengers(){
  passengerContainer.innerHTML = '';
  passengersCount = 0;
  addPassenger();
}

// Add passenger input group
function addPassenger(){
  passengersCount++;
  const div = document.createElement('div');
  div.className = 'passenger';
  div.innerHTML = `
    <label for="passenger-name-${passengersCount}">Name</label>
    <input type="text" id="passenger-name-${passengersCount}" name="passenger-name" required placeholder="Full name" />
    
    <label for="passenger-age-${passengersCount}">Age</label>
    <input type="number" id="passenger-age-${passengersCount}" name="passenger-age" required min="0" max="120" placeholder="Age" />
    
    <label for="passenger-gender-${passengersCount}">Gender</label>
    <select id="passenger-gender-${passengersCount}" name="passenger-gender" required>
      <option value="" disabled selected>Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
    
    ${passengersCount > 1 ? '<button type="button" class="remove-passenger" aria-label="Remove passenger">Remove</button>' : ''}
  `;
  passengerContainer.appendChild(div);

  if(passengersCount > 1){
    div.querySelector('.remove-passenger').addEventListener('click', () => {
      passengerContainer.removeChild(div);
    });
  }
}

// Select train on row click or keyboard Enter
trainListBody.addEventListener('click', e => {
  let tr = e.target.closest('tr');
  if(!tr || tr.getAttribute('aria-disabled') === 'true') return;
  selectTrainRow(tr);
});

trainListBody.addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === ' '){
    let tr = e.target.closest('tr');
    if(!tr || tr.getAttribute('aria-disabled') === 'true') return;
    e.preventDefault();
    selectTrainRow(tr);
  }
});

function selectTrainRow(tr){
  // Deselect all
  Array.from(trainListBody.rows).forEach(row => row.classList.remove('selected'));
  tr.classList.add('selected');
  const trainIndex = tr.dataset.trainIndex;
  const coachClass = tr.dataset.class;
  selectedTrain = { train: trainsData[trainIndex], class: coachClass, availability: Number(tr.dataset.availability) };
  // Auto select coach if it matches class options
  coachSelect.value = coachClass;
}

// On journey inputs change reload train list
[sourceStationSelect, destinationStationSelect, journeyDateInput].forEach(elem => {
  elem.addEventListener('change', loadAvailableTrains);
});

// Add passengers button
addPassengerBtn.addEventListener('click', () => {
  addPassenger();
});

// Booking form submit handler - train booking
bookingForm.addEventListener('submit', e => {
  e.preventDefault();
  if(eventSelect.value !== 'train'){
    alert('Train booking is only available for the Train event.');
    return;
  }

  // Validate journey details
  if(!sourceStationSelect.value || !destinationStationSelect.value){
    alert('Please select both source and destination stations.');
    return;
  }
  if(sourceStationSelect.value === destinationStationSelect.value){
    alert('Source and destination cannot be the same.');
    return;
  }
  if(!journeyDateInput.value){
    alert('Please select date of journey.');
    return;
  }
  if(!selectedTrain){
    alert('Please select a train from the list.');
    return;
  }
  if(coachSelect.value !== selectedTrain.class){
    alert('Please select coach matching selected train class.');
    return;
  }

  // Validate passengers details
  const passengerDivs = passengerContainer.querySelectorAll('.passenger');
  if(passengerDivs.length === 0){
    alert('Please add at least one passenger.');
    return;
  }
  let passengers = [];
  for(let div of passengerDivs){
    const name = div.querySelector('input[name="passenger-name"]').value.trim();
    const age = div.querySelector('input[name="passenger-age"]').value.trim();
    const gender = div.querySelector('select[name="passenger-gender"]').value;
    if(!name){
      alert('Please enter passenger name.');
      return;
    }
    const ageNum = Number(age);
    if(!age || isNaN(ageNum) || ageNum < 0 || ageNum > 120){
      alert('Please enter valid passenger age (0-120).');
      return;
    }
    if(!gender){
      alert('Please select passenger gender.');
      return;
    }
    passengers.push({ name, age: ageNum, gender });
  }

  if(passengers.length > selectedTrain.availability){
    alert(`Only ${selectedTrain.availability} seats available for selected coach.`);
    return;
  }

  // Generate random PNR (6 uppercase letters/numbers)
  const pnr = generatePNR();

  // Simulate seat allocation
  // For simplicity assign seat numbers 1 to number of passengers
  const allocatedSeats = [];
  for(let i=1; i<=passengers.length; i++){
    allocatedSeats.push(i);
  }

  // Show confirmation summary
  const summary = `
Booking Confirmed!\\n
PNR: ${pnr}\\n
Train: ${selectedTrain.train.name}\\n
Class: ${selectedTrain.class}\\n
Date: ${journeyDateInput.value}\\n
From: ${sourceStationSelect.value} To: ${destinationStationSelect.value}\\n
Passengers:\\n${passengers.map((p,i) => `  ${i+1}. ${p.name}, Age: ${p.age}, Gender: ${p.gender}, Seat No: ${allocatedSeats[i]}`).join('\\n')}
  `;

  alert(summary);

  // Display PNR info
  pnrDisplay.textContent = `Booking successful! Your PNR is: ${pnr}`;
  pnrDisplay.style.display = 'block';

  // Reset form for new booking
  bookingForm.reset();
  trainListBody.innerHTML = '';
  noTrainsMsg.style.display = 'none';
  trainModule.style.display = 'block';
  otherEventsMessage.style.display = 'none';
  selectedTrain = null;
  clearPassengers();
  addPassenger();
});

// Generate random PNR string
function generatePNR() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for(let i=0; i<6; i++){
    pnr += chars.charAt(Math.floor(Math.random()*chars.length));
  }
  return pnr;
}

// Initialize passenger form with one passenger
clearPassengers();
addPassenger();