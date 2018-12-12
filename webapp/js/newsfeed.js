function getNewsfeed(attachPoint, offset) {
    $.get('/getFeedFor', function(postData) {
        // Get the content for each post
        console.log("data is: ")
        console.log(postData);
        // TODO - Handle error
        let feed = postData.feed;
        // For each entry create a post div
        for (let i = 0; i < feed.length; i++) {
            let div = null;
            console.log("Type: " + feed[i].type);
            console.log(feed[i]);
            if (feed.type === "newFriendship") {

            } else if (feed.type === "statusUpdate") {

            } else if (feed.type === "friendPost") {

            } else if (feed.type === "profileUpdate") {
                
            }
            switch(feed.type) {
                case "newFriendship":
                    div = createNewFriendship(feed[i]);
                    console.log(div);
                    break;
                case "statusUpdate":
                    div = createStatusUpdate(feed[i]);
                    console.log(div);
                    break;
                case "friendPost":
                    div = createFriendPost(feed[i]);
                    console.log(div);
                    break;
                case "profileUpdate":
                    div = createProfileUpdate(feed[i]);
                    console.log(div);
                    break;
            }
            console.log(div);
            if (div) {
                attachPoint.appendChild(div);
            }
        }
    });
}

function createStatusUpdate(postData) {
    let div = document.createElement('div');
    div.classList.add("newsfeed-card");
    // Create display for profile picture
    let profPic = document.createElement('div');
    profPic.classList.add("newsfeed-prof-pic");
    // Create display for username
    let usernameDiv = document.createElement('div');
    usernameDiv.classList.add("newsfeed-user-name");
    usernameDiv.innerHTML = '<span class="newsfeed-clickable">' + postData.username + '</span> updated their status.</div>';
    // Add content
    let contentDiv = document.createElement('div')
    contentDiv.classList.add("newsfeed-status");
    contentDiv.innerText = postData.content;
    // Add like button
    let button = document.createElement('button');
    button.classList.add("newsfeed-like");
    button.innerText = "LIKE";
    // Add like counter
    let likeDiv = document.createElement('div');
    likeDiv.classList.add("newsfeed-likes");
    likeDiv.innerText = postData.likes;
    
    // Assemble div
    div.appendChild(profPic);
    div.appendChild(usernameDiv);
    div.appendChild(contentDiv);
    div.appendChild(button);
    div.appendChild(likeDiv);
    return div;
}

function createNewFriendship(postData) {
    let div = document.createElement('div');
    div.classList.add("newsfeed-card");
    // Create display for profile picture
    let profPic = document.createElement('div');
    profPic.classList.add("newsfeed-prof-pic");
    // Create display for username
    let usernameDiv = document.createElement('div');
    usernameDiv.classList.add("newsfeed-user-name");
    usernameDiv.innerHTML = '<span class="newsfeed-clickable">' + postData.username + '</span> is now friends with <span class="newsfeed-clickable">' + postData.receiver + '<span class="newsfeed-clickable">.</div>';
    // Add content
    let contentDiv = document.createElement('div')
    contentDiv.classList.add("newsfeed-card-info");
    // Add like button
    let button = document.createElement('button');
    button.classList.add("newsfeed-like");
    button.innerText = "LIKE";
    // Add like counter
    let likeDiv = document.createElement('div');
    likeDiv.classList.add("newsfeed-likes");
    likeDiv.innerText = postData.likes;
    
    // Assemble div
    div.appendChild(profPic);
    contentDiv.appendChild(usernameDiv);
    div.appendChild(contentDiv);
    div.appendChild(button);
    div.appendChild(likeDiv);
    return div;
}

function createFriendPost(postData) {
    let div = document.createElement('div');
    div.classList.add("newsfeed-card");
    // Create display for profile picture
    let profPic = document.createElement('div');
    profPic.classList.add("newsfeed-prof-pic");
    // Create display for username
    let usernameDiv = document.createElement('div');
    usernameDiv.classList.add("newsfeed-user-name");
    usernameDiv.innerHTML = '<span class="newsfeed-clickable">' + postData.username + '</span> posted to ' + postData.receiver + 's wall.</div>';
    // Add content
    let contentDiv = document.createElement('div')
    contentDiv.classList.add("newsfeed-status");
    contentDiv.innerText = postData.content;
    // Add like button
    let button = document.createElement('button');
    button.classList.add("newsfeed-like");
    button.innerText = "LIKE";
    // Add like counter
    let likeDiv = document.createElement('div');
    likeDiv.classList.add("newsfeed-likes");
    likeDiv.innerText = postData.likes;
    
    // Assemble div
    div.appendChild(profPic);
    div.appendChild(usernameDiv);
    div.appendChild(contentDiv);
    div.appendChild(button);
    div.appendChild(likeDiv);

    return div;
}

function createProfileUpdate(postData) {
    let div = document.createElement('div');
    div.classList.add("newsfeed-card");
    // Create display for profile picture
    let profPic = document.createElement('div');
    profPic.classList.add("newsfeed-prof-pic");
    // Create display for username
    let usernameDiv = document.createElement('div');
    usernameDiv.classList.add("newsfeed-user-name");
    usernameDiv.innerHTML = '<span class="newsfeed-clickable">' + postData.username + '</span> updated their ' + postData.content + '.</div>';
    // Add content
    let contentDiv = document.createElement('div')
    contentDiv.classList.add("newsfeed-card-info");
    // Add like button
    let button = document.createElement('button');
    button.classList.add("newsfeed-like");
    button.innerText = "LIKE";
    // Add like counter
    let likeDiv = document.createElement('div');
    likeDiv.classList.add("newsfeed-likes");
    likeDiv.innerText = postData.likes;
    
    // Assemble div
    div.appendChild(profPic);
    contentDiv.appendChild(usernameDiv);
    div.appendChild(contentDiv);
    div.appendChild(button);
    div.appendChild(likeDiv);
    return div;
}