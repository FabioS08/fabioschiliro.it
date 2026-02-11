//* ================ Github Configuration ================
const GITHUB_USERNAME = 'FabioS08';

//* ================ Path to the default repo cover image ================
const defaultCover = "data/Repo%20Cover/default.jpg"; 

//* ================ Map repo names to specific images or settings (i.e. ignore the repo or not) ================
// ? Parameters: 
// ?               - cover: path to the custom cover image for this repo (if not provided, default will be used)
// ?               - priority: higher priority repos will be shown first (default is 0)
// ?               - hide: if true, this repo will be completely ignored and not shown on the page
const repoConfig = {

    "Multimodal_3DOD_for_Smart_Infrastructures": { 
        cover: "data/Repo%20Cover/Multimodal_3DOD_for_Smart_Infrastructures.png", 
        priority: 100 
    },

    "Medical_Meadow_Question-Answering": { 
        cover: "data/Repo%20Cover/Medical_Meadow_Question-Answering.jpg", 
        priority: 1 
    },

    "The_More_The_Merrier": { 
        cover: "data/Repo%20Cover/The_More_The_Merrier.jpg", 
        priority: 1 
    },

    "Serverless_Scaling_with_Deep_Reinforcement_Learning": { 
        cover: "data/Repo%20Cover/Serverless_Scaling_with_Deep_Reinforcement_Learning.jpg", 
        priority: 1 
    },

    "Students_and_Companies": { 
        cover: "data/Repo%20Cover/Students_and_Companies.jpg", 
        priority: 0 
    },

    "fabioschiliro.it": { 
        cover: "data/Repo%20Cover/fabioschiliro.it.png", 
        priority: 0 
    },

    // TODO -> Add here the new repo info

    "FabioS08": { 
        hide: true 
    },

};

//* ================ Dynamically load the SVG signature ================
async function loadSignature() {
    
    const container = document.getElementById('signature-container'); 
    
    if (!container) return; 

    try {

        const response = await fetch('/data/Signature.svg');
        if (!response.ok) throw new Error('Signature file not found');
        
        const svgText = await response.text();
        container.innerHTML = svgText;
        
    } catch (error) {
        
        console.error("Error loading SVG:", error);
    
    }
}
loadSignature();


//* ================ Page Animation Logic ================
window.addEventListener('scroll', () => {

    const scrollY = window.scrollY;

    const logo = document.getElementById('logo');
    const signature = document.getElementById('signature-container');
    const intro = document.getElementById('intro-container');
    const main = document.getElementById('main-content');
    const glassWindow = document.querySelector('.glass-window');

    // Phase 1: Fade in signature over logo
    if (scrollY > 150) { 

        signature.classList.add('active'); 
        logo.style.opacity = Math.max(0.3, 1 - (scrollY / 200)); 
    
    } else {
    
        // Resets if you scroll back up
        signature.classList.remove('active'); 
        logo.style.opacity = 1;
    
    }
    
    // Phase 2: Fade out the whole intro screen
    if (scrollY > 300) {

        signature.style.opacity = 1;
        let fadeOutProgress = (scrollY - 300) / 300;

        intro.style.opacity = Math.max(0, 1 - fadeOutProgress);
        
    } else {

        intro.style.opacity = 1;
    
    }

    // Phase 3: Reveal Main Content
    if (scrollY > 500) {
        main.style.opacity = 1;
    } else {
        main.style.opacity = 0;
    }

    // Be sure the second scrollbar does not interfere with the first one until the user scrolls down to the glass window 
    if (scrollY > window.innerHeight - 50) {
        glassWindow.classList.add('interaction-active');
    } else {
        glassWindow.classList.remove('interaction-active');
    }
});


//* ================ Copy Email on Click ================
function copyEmail() {

    const email = document.getElementById("email-text").innerText;
    const tooltip = document.querySelector("#email-item .tooltip-text");

    navigator.clipboard.writeText(email).then(() => {
        tooltip.innerText = "Copied!";
        
        tooltip.style.setProperty('--tooltip-bg', '#4caf50');
        
        setTimeout(() => {

            tooltip.innerText = "Click to copy";
            tooltip.style.setProperty('--tooltip-bg', '#ff0015');
        
        }, 2000);
        
    }).catch(err => {

        console.error('Failed to copy: ', err);

    });
}


//* ================ Switch Tab when interacting with the nav bar ================
function switchTab(tabId) {
    
    // 1. Hide all content tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 2. Deactivate all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Activate selected tab and button
    document.getElementById(tabId).classList.add('active');
    
    // Find button that triggered this
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(btn => {
        if(btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });
}


//* ================ Updated Repo Fetching for Glass Cards ================
async function fetchRepos() {

    const repoGrid = document.getElementById('repo-grid');
    
    try {

        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated`);
        let repos = await response.json();

        repos.sort((a, b) => {

            const configA = repoConfig[a.name] || {};
            const configB = repoConfig[b.name] || {};
            
            const priorityA = configA.priority || 0; 
            const priorityB = configB.priority || 0; 

            return priorityB - priorityA;
        
        });

        repos.forEach(repo => {

            const config = repoConfig[repo.name] || {};

            if (config.hide) return;

            const bgImage = config.cover ? config.cover : defaultCover;
            const displayName = repo.name.replace(/_/g, ' ');

            const card = document.createElement('div');
            card.className = 'liquid-repo'; 

            card.style.cursor = "pointer";
            card.onclick = () => {
                window.open(repo.html_url, "_blank", "noopener,noreferrer");
            };

            card.innerHTML = `
                <div class = "repo-img" style = "background-image: url('${bgImage}');"></div>
                <div class = "repo-desc">
                    <h4>${displayName}</h4>
                    <p>${repo.description || "No description provided."}</p>
                </div>
            `;

            repoGrid.appendChild(card);

        });

    } catch (error) {

        console.error("Error fetching repos:", error);
        repoGrid.innerHTML = "<p>Could not load one/more repositories.</p>";
    
    }
}

fetchRepos();