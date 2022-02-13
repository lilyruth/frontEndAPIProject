import client from './env.mjs';

// Variables 
const App = {
 loggedIn: false,
 token: null,
 bio: null,
 business: null,
 help: null,
 links: [],
 location: null,
 profilePic: null,
 projectIds: [],
 projectSummaries: [],
 name: null,
 title: null,
 work: []
};

const getTokenUrl = "https://development.api.teams.wethos.co/oauth/token";
const getProjectsUrl = "https://development.api.teams.wethos.co/api/v2/projects";
const getProfileUrl = "https://development.api.teams.wethos.co/api/v2/currentspecialist";
const getLogoutUrl = "https://development.api.teams.wethos.co/api/v2/auth/signout";

// const main = document.getElementById('main');
const loadingScreen = document.getElementById('loading');
const logoutScreen = document.getElementById('logout');
const logoutButton = document.getElementById('logout-btn');
const darkModeToggle = document.getElementById('dark-mode-btn');
const root = document.querySelector(':root');
const whoBtn = document.getElementById('who-btn');
const whatBtn = document.getElementById('what-btn');
const whereBtn = document.getElementById('where-btn');
const whyBtn = document.getElementById('why-btn');
const who = document.getElementById('who');
const what = document.getElementById('what');
const where = document.getElementById('where');
const why = document.getElementById('why');


// Function Definitions

// Request Options to get the token
const requestOptions = {
 method: 'POST',
 body: client,
 headers: {
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest"
 },
 redirect: 'follow'
};

async function sendReqs(url1, url2) {
 if (!App.loggedIn) {
  await getToken();
 }

 let bearer = `Bearer ${App.token}`;

 let otherRequestOptions = {
  method: 'GET',
  headers: {
   "Content-Type": "application/json",
   "X-Requested-With": "XMLHttpRequest",
   "authorization": bearer,
  },
  redirect: 'follow'
 };

 //Projects Retrieval
 await fetch(url1, otherRequestOptions)
  .then(response => response.json())
  .then(response => {
   let projects = response.data;
   projects.forEach(item => {
    App.projectIds.push(item.id);
   })
  })
  .catch(error => console.log('error', error));

 //Project Summaries Retrieval
 App.projectIds.forEach(project => {
  fetch(url1 + '/' + project, otherRequestOptions)
   .then(response => response.json())
   .then(response => {
    let name = response.data.name;
    console.log('project name', response.data.name)
    let projectScopeSummary = response.data.scopes[0].categories;
    App.projectSummaries.push({ name, projectScopeSummary })
  
   })
 });

 //Profile Retrieval
 await fetch(url2, otherRequestOptions)
  .then(response => response.json())
  .then(response => {
   let data = response.data;

   //Profile Links
   let links = data.links;
   links.forEach(link => {
    let name = link.name;
    let url = link.url;
    App.links.push({ name, url })
  
   });
   // Work 
   let work = data.work;
   work.forEach(work => {
    let name = work.name;
    let description = work.role;
    let thumbnail = work.assets[1].public_url;

    App.work.push({ name, description, thumbnail })
  
   });

   // Bio
   App.bio = data.short_bio;

   // Title
   App.title = data.title;

   // Name
   App.name = data.signing_party;

   // Profile Pic URL
   App.profilePic = data.assets[0].public_url;

   // Location 
   App.location = data.location_display;

   // Service offered
   App.business = data.business_services[0];

   // Why Wethos
   App.help = data.get_from_wethos;
   

   // Build Pages

   // Who Page
   who.innerHTML = `
   <h1 class="heading">${App.name}</h1>
   <h2>${App.title}</h2>
   <h4>${App.bio}</h4>
   <h5>${App.location}</h5>
   `;
   
   // What Page 

   // There seems to be a lag with the double call to the endpoints. Setting a timeout helped give the app time to load this second call. I tested this with throttling--slow 3G network--and it was sufficient. 

   setTimeout(() => {
    what.innerHTML = `
    <h2>${App.business}</h2>
    <h3>Current projects going:</h3>
    <h4>${App.projectSummaries[0].name}, status: ${App.projectSummaries[0].projectScopeSummary[0]}</h4>
    <h4>${App.projectSummaries[1].name}, status: ${App.projectSummaries[1].projectScopeSummary[0]}</h4>
    <h4>${App.projectSummaries[2].name}, status: ${App.projectSummaries[2].projectScopeSummary[0]}</h4>
    `
   }, 1000)

  // Where Page
 
  console.log(App.work[2].description)
   where.innerHTML = `
   <h2 class="work">Take a look at my work:</h2>
   <br />
   <div class="work-projects">
    <div class="links">
     <a href='${App.links[1].url}' target="_blank">${App.links[1].name}</a>
     <a href='${App.links[0].url}' target="_blank">${App.links[0].name}</a>
    </div>
    <div class="projects">
     <div class="project">
       <img src='${App.work[0].thumbnail}' alt='thumbnail of work'></img>
       <p>${App.work[0].name}</p>
       <p>${App.work[0].description}</p>
     </div>
     <div class="project">
       <img src='${App.work[1].thumbnail}' alt='thumbnail of work'></img>
       <p>${App.work[1].name}</p>
       <p>${App.work[1].description}</p>
      </div>
     <div class="project omit">
       <img src='${App.work[2].thumbnail}' alt='thumbnail of work'></img>
       <p>${App.work[2].name}</p>
       <p>${App.work[2].description}</p>
      </div>
     </div>
   </div>
   `
  // Why Page

   why.innerHTML = `
  
   <h2>More than anything else,</h2>
   <img src='${App.profilePic}' alt='profile picture' />
   <h2>${App.help}</h2>
   `
  })
  .catch(error => console.log('error', error));
}

//Auth call

async function getToken() {
 let result = await fetch(getTokenUrl, requestOptions)
  .then(response => response.json())
  .then(result => {
   App.loggedIn = true;
   App.token = result.access_token
  })
  .catch(error => console.log('error', error))
};

// Log Out
async function logOut() {
 let bearer = `Bearer ${App.token}`;
 const requestOptions = {
  method: 'POST',
  headers: {
   "Content-Type": "application/json",
   "X-Requested-With": "XMLHttpRequest",
   "Authorization": bearer
  },
  redirect: 'follow'
 };
 await fetch(getLogoutUrl, requestOptions)
  .then(response => {
   console.log(response.status)
   App.loggedIn = false;
   logoutScreen.classList.remove('none');
   logoutButton.classList.add('none');
  })
  .catch(error => console.log('error', error));
 clear();
}

// Check status 

let pageStatus = setInterval(() => {
 let status = () => {
  if (App.loggedIn) return true;
  else {
   console.log('not logged in yet')
   return false;
  }
 };
 if (status) {
  clearInterval(pageStatus)
  return true;
 }
}, 200);

// Clear the page in order to load the page from the button click

function clear() {
 who.classList.add('none');
 what.classList.add('none');
 where.classList.add('none');
 why.classList.add('none');
}

// Event Listeners 
// Page Load
window.addEventListener('load', () => {
 sendReqs(getProjectsUrl, getProfileUrl)

 if (pageStatus) {
  console.log('logged in')
  loadingScreen.style.display = 'none';
 }
});

// Dark Mode

darkModeToggle.addEventListener('click', () => {
 root.classList.toggle('dark-theme');
})

// Page Menu

whoBtn.addEventListener('click', () => {
 clear();
 if (!App.loggedIn) {
  who.classList.add('none');
 } else {
  who.classList.remove('none');
 }
});

whatBtn.addEventListener('click', () => {
 clear();
 if (!App.loggedIn) {
  what.classList.add('none');
 } else {
  what.classList.remove('none');
 }
});

whereBtn.addEventListener('click', () => {
 clear();
 if (!App.loggedIn) {
  where.classList.add('none');
 } else {
  where.classList.remove('none');
 }
});

whyBtn.addEventListener('click', () => {
 clear();
 if (!App.loggedIn) {
  why.classList.add('none');
 } else {
  why.classList.remove('none');
 }
})

// Logout

logoutButton.addEventListener('click', logOut);








