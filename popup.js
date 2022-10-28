// This is all the js logic for the extension popup window
console.log("New message from Popup.js!")


// const test_btn = document.getElementById("test_btn");

// test_btn.addEventListener("click", (e) => {
//     console.log("test!~")
// })

// Gather all necessary buttons and elements
const screen_reader_btn = document.getElementById("screen-reader");
const dictionary_btn = document.getElementById("dictionary");
const page_struct_btn = document.getElementById("page-structure");
const text_size_btn = document.getElementById("text-size");
const line_height_btn = document.getElementById("line-height");
const word_spacing_btn = document.getElementById("word-spacing");

let buttons = Array.from(document.getElementsByClassName("button"));
let radio = Array.from(document.getElementsByTagName("input"));


// let html = document.getElementsByTagName("html");
// console.log(html);

// Highlights active buttons/tools
function toggleBtnActive(btn) {
    btn.classList.toggle("active");
    console.log("hello again");
};

// if radio button is clicked, activate its larger button container


// Check for big button activations
for (let btn of buttons) {
    btn.addEventListener("click", (e) => {
        // btn.classList.toggle("active")
        if (btn.id == "text-size") {
            console.log("text-btn pressed")
            chrome.tabs.setZoom(1);
        }

        if (btn.classList.toString().includes("active")) {
            // let localSubBtns = Array.from()
            console.log("new active button");
            let button_sibling = btn.nextElementSibling;
            if (button_sibling != null) {
                let subBtns = Array.from(button_sibling.childNodes);
                console.log(subBtns);
                for (let SBtn of subBtns) {
                    SBtn.checked = false;
                }
            }
        } 
        // Revert zoom effect back to default
            
            toggleBtnActive(btn);
            
    })
};

for (let rad of radio) {
    rad.addEventListener("change", e => {
        rad.parentNode.previousElementSibling.classList.add("active");
      
    })
};

function changeTextSize() {

    console.log("text size btn clicked");

    function getTabs(tabs) {
        console.log(tabs);
        console.log(tabs[0].id);
        let message = {txt: "hello from popup!"};
        chrome.tabs.sendMessage(tabs[0].id, "hello content! This is my message");
    }

    let queryOptions = { active: true, lastFocusedWindow: true, currentWindow: true };
    chrome.tabs.query(queryOptions, getTabs)

}


// Text size sub button handlers
const small_text = document.getElementById("small-1");
const med_text = document.getElementById("medium-1");
const lg_text = document.getElementById("large-1");

small_text.addEventListener("click", e => {
    chrome.tabs.setZoom(1);
})

med_text.addEventListener("click", e => {
    chrome.tabs.setZoom(1.75);
})

lg_text.addEventListener("click", e => {
    chrome.tabs.setZoom(2.5);
})


// function changeTextColor() {

//     console.log("text color btn clicked");

//     // getTabs callback function for chrome.tabs.query
//     function getTabs(tabs) {
//         console.log(tabs);
//         console.log(tabs[0].id);
//         chrome.tabs.setZoom(3);
//         // chrome.tabs.sendMessage(tabs[0].id, "40px");
//         //125, 175, 250
//     }

//     let queryOptions = { active: true, lastFocusedWindow: true, currentWindow: true };
//     chrome.tabs.query(queryOptions, getTabs);

// }


// SEND MESSAGE FROM EXT TO CONTENT SCRIPT
function test_message () {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, "This is a new message!!!!");
      });
}

test_message();




//text_size_btn.addEventListener("click", e => {changeTextColor()});
text_size_btn.addEventListener("click", e => {chrome.tabs.setZoom(1)});
line_height_btn.addEventListener("click", e => {sendLineHeight("1rem")});

// Line height sub button handlers
const small_height = document.getElementById("small-2");
const med_height = document.getElementById("medium-2");
const lg_height = document.getElementById("large-2");

function sendLineHeight(height) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"role": "line-height", "value": height});
      })
}

small_height.addEventListener("click", e => {sendLineHeight("1rem")});
med_height.addEventListener("click", e => {sendLineHeight("3rem")});
lg_height.addEventListener("click", e => {sendLineHeight("5rem")});

// Word Spacing Handlers
word_spacing_btn.addEventListener("click", e => {sendWordSpace("0rem")});

function sendWordSpace(space) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"role": "word-spacing", "value": space});
      })
}

const small_space = document.getElementById("small-3");
const med_space = document.getElementById("medium-3");
const lg_space = document.getElementById("large-3");

small_space.addEventListener("click", e => {sendWordSpace("0rem")});
med_space.addEventListener("click", e => {sendWordSpace(".5rem")});
lg_space.addEventListener("click", e => {sendWordSpace("1rem")});

// Page structure Handler
function launchPageStructModal() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"role": "page-struct", "value": null});
      })
}


// text_size_btn.addEventListener("click", async function() {
//     console.log("text size btn clicked")

//     // send message command to change text-size of current webpage
//     // if (getCurrentTab() != undefined) {
//     //     console.log(typeof(getCurrentTab().id));
//     //     chrome.tabs.sendMessage(getCurrentTab().id, "Message from popup to content page!")
//     // }
//     //let tab = await getCurrentTab()
//     //console.log(tab);
//     console.log(getCurrentTab());
//     console.log(getCurrentTab.then);
//     getCurrentTab.then(value => {
//         console.log(value.id);
//     })
//     //chrome.tabs.sendMessage(tab.id, "Message from popup to content page!")
// });


// screen_reader_btn.addEventListener("click",);
// dictionary_btn.addEventListener("click",);
page_struct_btn.addEventListener("click", e => {
    console.log("page struct button pressed");
    launchPageStructModal();
    window.close();
});