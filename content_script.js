// This is all the js logic for the active web page the extension is activated on
console.log("New message from Content Script!")

tab_title = document.getElementsByTagName("title")[0].innerHTML;
console.log(tab_title)

// chrome.tabs.sendMessage(tab.id, {message: tab_title});

// Turn all paragraphs on webpage pink
// let paragraphs = document.getElementsByTagName('p');
// for (p of paragraphs) {
//     p.style['background-color'] = "#D9D9D9";
// }

// OLD Modal Testing
// let modal_window = document.createElement("dialog");
// modal_window.setAttribute("id", "structure_modal");
// modal_window.style["width"] = "500px";
// let test_text = document.createTextNode("Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure, natus maiores velit iusto earum odit, fugiat, possimus rerum sed amet ad harum! A quam delectus, porro quae architecto quisquam earum nulla dolore quaerat eveniet qui ex fugit voluptas illo similique distinctio. Inventore nisi culpa nostrum adipisci totam! Unde maiores id optio aliquid ratione suscipit autem, rerum deleniti quia tenetur debitis doloremque, eos, fugit ullam fugiat sapiente laudantium est voluptatem? Veniam ratione nisi nihil, non odio ad natus amet officia perferendis. Necessitatibus provident corrupti dignissimos cupiditate autem quis, facilis dolorem possimus itaque ut voluptate iste sed repellendus eos at incidunt corporis.")
// modal_window.append(test_text);

// let close_modal_btn = document.createElement("button");
// close_modal_btn.append(document.createTextNode("Close"));

// modal_window.append(close_modal_btn);
// document.body.append(modal_window);

// close_modal_btn.addEventListener("click", e => {
//     modal_window.close();
// })

// MODAL LOGIC
// Create lists of document body, header, and paragraph elements.
let bodyElements = document.body.getElementsByTagName("*");
let headers = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
let paragraphs = Array.from(document.querySelectorAll("p"));

// Create modal element
let modal = document.createElement("dialog");
const modalTitle = document.createElement("h1");
const modalTitleText = "Page Structure";

modal.setAttribute("id", "ext-structure-modal");
modalTitle.append(modalTitleText);
modal.append(modalTitle);
document.body.append(modal);

// console.log(body_elements);
// console.log(headers);
// console.log(paragraphs);

//1. Cycle through body of doc
// Initialize count for assigning incrementing id's for page link navigation
let ext_header_id = 0;

for (let el of bodyElements) {
  //2. If current element is a header, create a button for it
  if (headers.includes(el)) {

    el.setAttribute("id", `ext-body-header-${ext_header_id}`);


    let button = document.createElement("button");
    let buttonText = document.createElement("p");

    // button.setAttribute("class", "accordion");
    button.classList.add("accordion");
    buttonText.classList.add("text-width-limit", "ext-modal-p");
    buttonText.append("(" + el.tagName + "): " + el.textContent);
    // Add class to limit header text length overflow
    button.append(buttonText);

    let headerLink = document.createElement("a");
    let headerLinkText =  document.createElement("p")
    headerLinkText.append("Link");
    headerLink.setAttribute("href", "#" + el.id);
    headerLink.setAttribute("class", "header-link-ext");
    headerLink.append(headerLinkText);
    button.append(headerLink);

    console.log("header id number: " + ext_header_id);
    modal.append(button);
    ext_header_id++;
    // console.log(el);
   //3. Else if the current element is a p, create a dropdown, assign the p content, and assign the dropdown to the last header button.
  } else if (paragraphs.includes(el)) {
    let dropdown = document.createElement("div");
    let dropdown_text = document.createElement("p");
    dropdown.setAttribute("class", "dropdown")
    dropdown_text.append(el.textContent);
    dropdown.append(dropdown_text);
    modal.append(dropdown);
    // console.log(el.innerHTML);
  }
}

let close_modal_btn = document.createElement("button");
close_modal_btn.setAttribute("class", "close-modal-btn");

close_modal_btn.append(document.createTextNode("Close"));
close_modal_btn.addEventListener("click", e => {
    modal.close();
})

modal.append(close_modal_btn);
document.body.append(modal);



// Adding event listeners to the header buttons
let accordions = document.getElementsByClassName("accordion")
for (let accordion of accordions) {
    if (accordion.nextElementSibling.classList.contains("dropdown")) {
        accordion.classList.add("has-dropdown");
        // accordion.append(" MORE TEXT");
        accordion.addEventListener("click", e => {
        accordion.classList.toggle("active-acc");
        console.log(accordion.nextElementSibling);
        // If next element is not another header,
        if (accordion.nextElementSibling.classList.contains("dropdown")) {
          let acc_dropdown = accordion.nextElementSibling;
          if (acc_dropdown.style.maxHeight) {
            acc_dropdown.style.maxHeight = null;
          } else {
            acc_dropdown.style.maxHeight = acc_dropdown.scrollHeight + "px";
          }
        }
      })
    }
}

// END OF CODEPEN

// Adding event listeners for document header links
for (let link of document.querySelectorAll(".header-link-ext")) {
  // console.log("link: ", link);
    link.addEventListener("click", e => {
      let link_href = link.getAttribute("href");
      let link_target = document.getElementById(link_href.substring(1));
      link_target.style["background-color"] = "orange";
      modal.close()

      // Highlight header

    })
}

//modal_window.showModal();
// async function getCurrentTab() {
//     let queryOptions = { active: true, lastFocusedWindow: true };
//     // `tab` will either be a `tabs.Tab` instance or `undefined`.
//     let [tab] = await chrome.tabs.query(queryOptions);
//     console.log(tab);
//   }

// getCurrentTab();

function gotMessage(request, sender, sendResponse) {
    console.log(request)
    if (request["role"] == "line-height") {
        document.body.style["line-height"] = request["value"];
        for (let el of Array.from(document.getElementsByTagName("a"))) {
            el.style["line-height"] = request["value"];
        }
    } else if (request["role"] == "word-spacing") {
        document.body.style["word-spacing"] = request["value"];
    } else if (request["role"] == "page-struct") {
        modal.showModal();
    }
    
    // let paragraphs = document.getElementsByTagName('p');
    // document.body.style["font-size"] = "10rem";
    // document.documentElement.style["font-size"] = "200%";
    // chrome.tabs.setZoom(zoomFactor=100);
    
}

chrome.runtime.onMessage.addListener(gotMessage)

console.log("viewport width: ", window.visualViewport.width);


