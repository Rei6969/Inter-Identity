import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  child,
  push,
  onValue,
  query,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  listAll,
  deleteObject,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPgWFqszS_2o_40rIUbZhSDPgsxl3u5n0",
  authDomain: "interidentity-90d32.firebaseapp.com",
  databaseURL: "https://interidentity-90d32-default-rtdb.firebaseio.com",
  projectId: "interidentity-90d32",
  storageBucket: "interidentity-90d32.appspot.com",
  messagingSenderId: "564846928127",
  appId: "1:564846928127:web:abf02f06edd576fcd12cca",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase();
const storage = getStorage(firebaseApp);

document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.querySelector(".inp-insert-img-post");

  // FIREBASE UPLOAD =================================================================================================================================
  const postContent = document.querySelector(
    ".insert-post-container .inp-insert-post"
  );
  const discussionContent = document.querySelector(
    ".discussion-post-container .inp-discussion-post"
  );
  const userProfile = document.querySelectorAll(".post-user-profile");
  const btnInsertPost = document.querySelector(
    ".insert-post-container .btn-insert-post"
  );
  const btnInsertDiscussion = document.querySelector(
    ".discussion-post-container .btn-discussion-post"
  );

  postContent.value = "";
  discussionContent.value = "";
  let userID;
  let userData;
  let withImg = false;

  auth.onAuthStateChanged((user) => {
    if (user) {
      userID = user.uid;

      const userRef = ref(database, "users/" + user.uid);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          userData = snapshot.val();

          if (userData.profileImg != "none") {
            const imageRef = storageRef(
              storage,
              `profileImg/${userData.email}/${userData.profileImg}`
            );

            getDownloadURL(imageRef)
              .then((url) => {
                userProfile.forEach((img) => {
                  img.setAttribute("src", url);
                  img.style.objectFit = "cover";
                  img.style.objectPosition = "center";
                });
              })
              .catch((error) => {
                console.error("Error getting download URL:", error);
              });
          }

          // BLOG
          btnInsertPost.addEventListener("click", () => {
            if (postContent.value != "" || imageInput.value != "") {
              const postRef = ref(database, "posts");
              const newPostRef = push(child(postRef, userID));
              const postID = newPostRef.key;

              if (imageInput.value != "") {
                withImg = true;
                const imgFiles = imageInput.files;

                for (let i = 0; i < imgFiles.length; i++) {
                  const file = imgFiles[i];
                  const imgStorageRef = storageRef(
                    storage,
                    `posts/${userID}/${postID}/${file.name}`
                  );

                  try {
                    const snapshot = uploadBytes(imgStorageRef, file);
                  } catch (error) {
                    console.error(`Error uploading file: ${file.name}`, error);
                  }
                }
              }

              let currentDate = new Date();
              let year = currentDate.getFullYear();
              let month = String(currentDate.getMonth() + 1).padStart(2, "0");
              let day = String(currentDate.getDate()).padStart(2, "0");

              let postDate = `${month}-${day}-${year}`;

              const currentUserFName = userData.fName;
              const currentUserLName = userData.lName;
              const currentUserEmail = userData.email;
              const currentUserProfileImg = userData.profileImg;

              set(child(postRef, `${userID}/${postID}`), {
                postID: postID,
                userFName: currentUserFName,
                userLName: currentUserLName,
                userEmail: currentUserEmail,
                userProfileImg: currentUserProfileImg,
                postContent: postContent.value,
                withImg: withImg,
                postReacts: 0,
                postDate: postDate,
              });

              document.querySelector(".insert-post-container").style.display =
                "none";
            } else {
              alert("Please input something.");
            }
          });
          // BLOG END

          // DISCUSSION
          btnInsertDiscussion.addEventListener("click", () => {
            if (discussionContent.value != "") {
              const discussionRef = ref(database, "discussions");
              const newDiscussionRef = push(child(discussionRef, userID));
              const discussionID = newDiscussionRef.key;

              let currentDate = new Date();
              let year = currentDate.getFullYear();
              let month = String(currentDate.getMonth() + 1).padStart(2, "0");
              let day = String(currentDate.getDate()).padStart(2, "0");

              let discussionDate = `${month}-${day}-${year}`;

              const currentUserFName = userData.fName;
              const currentUserLName = userData.lName;
              const currentUserEmail = userData.email;
              const currentUserProfileImg = userData.profileImg;

              set(child(discussionRef, `${userID}/${discussionID}`), {
                discussionID: discussionID,
                userFName: currentUserFName,
                userLName: currentUserLName,
                userEmail: currentUserEmail,
                userProfileImg: currentUserProfileImg,
                discussionContent: discussionContent.value,
                discussionReacts: 0,
                discussionDate: discussionDate,
              });

              document.querySelector(
                ".discussion-post-container"
              ).style.display = "none";
            } else {
              alert("Please input something.");
            }
          });
          // DISCUSSION END
        }
      });
    }
  });
  // FIREBASE UPLOAD END =================================================================================================================================

  // UPLOAD IMAGE =================================================================================================================================
  const previewContainer = document.querySelector(".preview-container");

  const handleUploadImage = () => {
    imageInput.value = "";
    previewContainer.value = "";
    const maxImages = 9;

    imageInput.addEventListener("change", () => {
      previewContainer.innerHTML = "";

      if (imageInput.files.length > maxImages) {
        alert("You can only upload up to 9 images.");

        const dataTransfer = new DataTransfer();

        Array.from(imageInput.files)
          .slice(0, maxImages)
          .forEach((file) => {
            dataTransfer.items.add(file);
            displayPreview(file);
          });

        imageInput.files = dataTransfer.files;
      } else {
        Array.from(imageInput.files).forEach((file) => {
          displayPreview(file);
        });
      }
    });

    const displayPreview = (file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgElement = document.createElement("img");
        imgElement.src = event.target.result;
        previewContainer.appendChild(imgElement);
      };
      reader.readAsDataURL(file);
    };
  };

  handleUploadImage();
  // UPLOAD IMAGE END =================================================================================================================================

  // DISPLAY BLOGS =================================================================================================================================
  const adjustComment = () => {
    const inpComment = document.querySelectorAll(".inp-comment");

    const autoResizeComment = (input) => {
      if (input.value != "") {
        input.style.height = "auto";
        input.style.maxHeight = "100px";
        input.style.height = input.scrollHeight + "px";
      } else {
        input.style.maxHeight = "50px";
      }
    };

    inpComment.forEach((input) => {
      input.addEventListener("input", () => autoResizeComment(input));
    });
  };

  const displayBlogs = () => {
    const cardContainer = document.querySelector(".card-container");

    const postsRef = ref(database, "posts");

    const sortedPostsQuery = query(postsRef, orderByChild("postDate"));

    onValue(sortedPostsQuery, async (snapshot) => {
      const postsData = snapshot.val();
      cardContainer.innerHTML = "";

      const allPosts = [];

      for (let userId in postsData) {
        for (let postId in postsData[userId]) {
          const post = postsData[userId][postId];

          const commentsRef = ref(
            database,
            `posts/${userId}/${postId}/comments`
          );

          const commentsSnapshot = await get(commentsRef);
          const commentsData = commentsSnapshot.val();
          const commentsArray = [];

          if (commentsData) {
            for (let commentId in commentsData) {
              commentsArray.push({
                commentId: commentId,
                commentContent: commentsData[commentId].commentContent,
                userEmail: commentsData[commentId].userEmail,
                userFName: commentsData[commentId].userFName,
                userLName: commentsData[commentId].userLName,
              });
            }
          }

          allPosts.push({
            userId: userId,
            postId: postId,
            postContent: post.postContent,
            postDate: post.postDate,
            postReacts: post.postReacts,
            userEmail: post.userEmail,
            userFName: post.userFName,
            userLName: post.userLName,
            userProfileImg: post.userProfileImg,
            withImg: post.withImg,
            comments: commentsArray,
            reactsUsers: post.reactsUsers || {},
          });
        }
      }

      allPosts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

      allPosts.forEach((post) => {
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const cardLeft = document.createElement("div");
        cardLeft.classList.add("card-left");

        const cardHeader = document.createElement("div");
        cardHeader.classList.add("card-header");

        const userImage = document.createElement("img");
        const profileImgFolderRef = storageRef(
          storage,
          `profileImg/${post.userEmail}`
        );

        listAll(profileImgFolderRef).then((res) => {
          if (res.items.length > 0) {
            getDownloadURL(res.items[0]).then((url) => {
              userImage.src = url;
              userImage.alt = "";
            });
          } else {
            userImage.src = "./../media/images/default-profile.png";
            userImage.alt = "Default image";
          }
        });

        const nameAndDate = document.createElement("div");
        nameAndDate.classList.add("name-date-container");
        nameAndDate.style.display = "flex";
        nameAndDate.style.flexDirection = "column";

        const username = document.createElement("h3");
        username.textContent = `${post.userFName} ${post.userLName}`;
        username.style.margin = "0";
        username.style.padding = "0";

        const dateIconContainer = document.createElement("div");
        dateIconContainer.style.display = "flex";

        const headerDate = document.createElement("p");
        headerDate.textContent = `${post.postDate}`;
        headerDate.style.margin = "0";
        headerDate.style.marginRight = "5px";
        headerDate.style.padding = "0";

        const blogIcon = document.createElement("img");
        blogIcon.src = "./../media/icons/icons8-goodnotes-100.png";
        blogIcon.alt = "blog";
        blogIcon.classList.add("indicator-icon");

        dateIconContainer.appendChild(headerDate);
        dateIconContainer.appendChild(blogIcon);

        nameAndDate.appendChild(username);
        nameAndDate.appendChild(dateIconContainer);

        cardHeader.appendChild(userImage);
        cardHeader.appendChild(nameAndDate);

        const postContent = document.createElement("p");
        postContent.classList.add("post-content");
        postContent.textContent = post.postContent;
        postContent.style.whiteSpace = "pre-wrap";

        const postImgContainer = document.createElement("div");
        postImgContainer.classList.add("post-img-container", post.postId);

        const images = [];

        if (post.withImg) {
          const postImgRef = storageRef(
            storage,
            `posts/${post.userId}/${post.postId}`
          );

          listAll(postImgRef)
            .then((res) => {
              const downloadPromises = res.items.map((itemRef) => {
                return getDownloadURL(itemRef)
                  .then((url) => {
                    images.push(url);
                  })
                  .catch((error) => {
                    console.error("Error getting download URL:", error);
                  });
              });

              return Promise.all(downloadPromises);
            })
            .then(() => {
              const handlePostImg = () => {
                const imgContainer = document.querySelector(`.${post.postId}`);
                const modal = document.querySelector(".modal");
                const modalImg = document.querySelector(".modal-content");
                const closeModal = document.querySelector(".btn-modal-close");
                const prevModal = (document.querySelector(
                  ".btn-modal-prev"
                ).style.display = "none");
                const nextModal = (document.querySelector(
                  ".btn-modal-next"
                ).style.display = "none");

                let currentIndex = 0;

                images.forEach((src, index) => {
                  const img = document.createElement("img");
                  img.src = src;
                  img.alt = "image";
                  img.dataset.index = index;
                  img.addEventListener("click", () => {
                    openModal(index);
                  });
                  imgContainer.appendChild(img);
                });

                const adjustGridColumns = () => {
                  const numImages = images.length;
                  if (numImages <= 1) {
                    imgContainer.style.gridTemplateColumns = "repeat(1, 1fr)";
                  } else if (numImages == 2) {
                    imgContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
                  } else {
                    imgContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
                  }
                };

                adjustGridColumns();

                const openModal = (index) => {
                  currentIndex = index;
                  modal.style.display = "flex";
                  modalImg.src = images[currentIndex];
                };

                closeModal.onclick = () => {
                  modal.style.display = "none";
                };

                window.onclick = (event) => {
                  if (event.target == modal) {
                    modal.style.display = "none";
                  }
                };
              };

              handlePostImg();
            })
            .catch((error) => {
              console.error("Error listing items:", error);
            });
        }

        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.id = "modal";

        const modalImage = document.createElement("img");
        modalImage.classList.add("modal-content");
        modalImage.id = "modalImage";

        const btnModalClose = document.createElement("span");
        btnModalClose.classList.add("btn-modal-close");
        btnModalClose.textContent = "×";

        const btnModalPrev = document.createElement("span");
        btnModalPrev.classList.add("btn-modal-prev");
        btnModalPrev.textContent = "‹";

        const btnModalNext = document.createElement("span");
        btnModalNext.classList.add("btn-modal-next");
        btnModalNext.textContent = "›";

        modal.appendChild(modalImage);
        modal.appendChild(btnModalClose);
        modal.appendChild(btnModalPrev);
        modal.appendChild(btnModalNext);

        cardLeft.appendChild(cardHeader);
        cardLeft.appendChild(postContent);
        cardLeft.appendChild(postImgContainer);
        cardLeft.appendChild(modal);

        const cardRight = document.createElement("div");
        cardRight.classList.add("card-right");

        const commentsHeader = document.createElement("h3");
        commentsHeader.style.textAlign = "center";
        commentsHeader.style.marginTop = "0";
        commentsHeader.textContent = "Comments";

        cardRight.appendChild(commentsHeader);

        const commentContentContainer = document.createElement("div");
        commentContentContainer.classList.add("comment-content-container");

        // COMMENT CONTENT
        if (post.comments) {
          post.comments.forEach((comment) => {
            const commentContainer = document.createElement("div");
            commentContainer.classList.add("comment-container");

            const commentImg = document.createElement("img");

            const commentUserProfileRef = storageRef(
              storage,
              `profileImg/${comment.userEmail}`
            );

            listAll(commentUserProfileRef).then((res) => {
              if (res.items.length > 0) {
                getDownloadURL(res.items[0]).then((url) => {
                  commentImg.src = url;
                  commentImg.alt = "";
                });
              } else {
                commentImg.src = "./../media/images/default-profile.png";
                commentImg.alt = "Default image";
              }
            });

            const commentContent = document.createElement("div");
            commentContent.classList.add("comment-content");

            const commentUserName = document.createElement("h4");
            commentUserName.classList.add("comment-user-name");
            commentUserName.textContent = `${comment.userFName} ${comment.userLName}`;

            const commentP = document.createElement("p");
            commentP.textContent = comment.commentContent;

            commentContent.appendChild(commentUserName);
            commentContent.appendChild(commentP);

            commentContainer.appendChild(commentImg);
            commentContainer.appendChild(commentContent);

            commentContentContainer.appendChild(commentContainer);
          });
        }
        // COMMENT CONTENT END

        cardRight.appendChild(commentContentContainer);

        const cardFooter = document.createElement("div");
        cardFooter.classList.add("card-footer");

        const iconContainer = document.createElement("div");
        iconContainer.style.display = "flex";
        iconContainer.style.flexDirection = "column";
        iconContainer.style.alignItems = "center";

        const footerIcon = document.createElement("img");
        footerIcon.src =
          post.reactsUsers && userID && post.reactsUsers[userID]
            ? "./../media/icons/icons8-heart-50-red.png"
            : "./../media/icons/icons8-heart-50.png";
        footerIcon.alt = "icon";
        footerIcon.classList.add("footer-icon");

        const iconCount = document.createElement("p");
        iconCount.textContent = post.postReacts;
        iconCount.style.margin = "0";
        iconCount.style.padding = "0";

        iconContainer.appendChild(footerIcon);
        iconContainer.appendChild(iconCount);

        footerIcon.addEventListener("click", () => {
          if (!userID) {
            alert("Please log in to react to posts.");
            return;
          }

          const postRef = ref(database, `posts/${post.userId}/${post.postId}`);

          get(postRef).then((snapshot) => {
            const postData = snapshot.val();
            const reactsUsers = postData.reactsUsers || {};
            const hasReacted = !!reactsUsers[userID];

            if (hasReacted) {
              postData.postReacts = postData.postReacts - 1;
              delete reactsUsers[userID];
            } else {
              postData.postReacts = postData.postReacts + 1;
              reactsUsers[userID] = true;
            }

            postData.reactsUsers = reactsUsers;

            set(postRef, postData)
              .then(() => {
                footerIcon.src = hasReacted
                  ? "./../media/icons/icons8-heart-50.png"
                  : "./../media/icons/icons8-heart-50-red.png";
                iconCount.textContent = postData.postReacts;
              })
              .catch((error) => {
                console.error("Error updating post reacts:", error);
              });
          });
        });

        iconContainer.appendChild(footerIcon);
        iconContainer.appendChild(iconCount);

        const commentTextarea = document.createElement("textarea");
        commentTextarea.id = "inp-comment";
        commentTextarea.classList.add("inp-comment");
        commentTextarea.placeholder = "Add a comment";
        commentTextarea.maxLength = "200";

        const sendIcon = document.createElement("img");
        sendIcon.src = "./../media/icons/icons8-send-32.png";
        sendIcon.alt = "send";
        sendIcon.classList.add("send-icon");

        sendIcon.addEventListener("click", () => {
          const commentContent = commentTextarea.value.trim();
          if (commentContent) {
            const commentRef = ref(
              database,
              `posts/${post.userId}/${post.postId}/comments`
            );
            const newCommentRef = push(commentRef);
            const commentID = newCommentRef.key;

            const newComment = {
              commentContent: commentContent,
              userEmail: userData.email,
              userFName: userData.fName,
              userLName: `${userData.lName}`,
            };

            set(newCommentRef, newComment)
              .then(() => {
                console.log("Comment added successfully");
              })
              .catch((error) => {
                console.error("Error adding comment:", error);
              });
          }
        });

        cardFooter.appendChild(iconContainer);

        cardFooter.appendChild(commentTextarea);
        cardFooter.appendChild(sendIcon);

        cardRight.appendChild(cardFooter);

        cardBody.appendChild(cardLeft);
        cardBody.appendChild(cardRight);

        cardContainer.appendChild(cardBody);
      });

      adjustComment();
    });
  };

  // displayBlogs();
  // DISPLAY BLOGS END =================================================================================================================================

  // DISPLAY DISCUSSIONS ===============================================================================================================================
  const displayComments = (event) => {
    const commentContainer = event.target
      .closest(".discussion-body-container")
      .querySelector(".discussion-comment-container");
    commentContainer.classList.toggle("active");
  };

  const displayDiscussions = () => {
    const discussionCardContainer = document.querySelector(
      ".discussion-card-container"
    );
    const discussionsRef = ref(database, "discussions");
    const sortedDiscussionsQuery = query(
      discussionsRef,
      orderByChild("postDate")
    );

    onValue(sortedDiscussionsQuery, async (snapshot) => {
      const discussionsData = snapshot.val();
      discussionCardContainer.innerHTML = "";

      const allDiscussions = [];
      for (let userId in discussionsData) {
        for (let discussionID in discussionsData[userId]) {
          const discussion = discussionsData[userId][discussionID];

          const commentsRef = ref(
            database,
            `discussions/${userId}/${discussionID}/comments`
          );
          const commentsSnapshot = await get(commentsRef);
          const commentsData = commentsSnapshot.val();
          const commentsArray = [];

          if (commentsData) {
            for (let commentID in commentsData) {
              const repliesRef = ref(
                database,
                `discussions/${userId}/${discussionID}/comments/${commentID}/replies`
              );
              const repliesSnapshot = await get(repliesRef);
              const repliesData = repliesSnapshot.val();
              const repliesArray = [];

              if (repliesData) {
                for (let replyID in repliesData) {
                  repliesArray.push({
                    replyID: replyID,
                    replyContent: repliesData[replyID].replyContent,
                    userEmail: repliesData[replyID].userEmail,
                    userFName: repliesData[replyID].userFName,
                    userLName: repliesData[replyID].userLName,
                  });
                }
              }

              commentsArray.push({
                commentID: commentID,
                commentContent: commentsData[commentID].commentContent,
                userEmail: commentsData[commentID].userEmail,
                userFName: commentsData[commentID].userFName,
                userLName: commentsData[commentID].userLName,
                replies: repliesArray,
              });
            }
          }

          allDiscussions.push({
            userId: userId,
            discussionID: discussionID,
            discussionContent: discussion.discussionContent,
            discussionDate: discussion.discussionDate,
            discussionReacts: discussion.discussionReacts,
            userEmail: discussion.userEmail,
            userFName: discussion.userFName,
            userLName: discussion.userLName,
            userProfileImg: discussion.userProfileImg,
            comments: commentsArray,
            reactsUsers: discussion.reactsUsers || {},
          });
        }
      }

      allDiscussions.sort(
        (a, b) => new Date(b.discussionDate) - new Date(a.discussionDate)
      );

      allDiscussions.forEach((discussion, index) => {
        const discussionBodyContainer = document.createElement("div");
        discussionBodyContainer.classList.add("discussion-body-container");

        const discussionTopContainer = document.createElement("div");
        discussionTopContainer.classList.add("discussion-top-container");

        const discussionHeader = document.createElement("div");
        discussionHeader.classList.add("discussion-header");

        const userImage = document.createElement("img");
        const profileImgFolderRef = storageRef(
          storage,
          `profileImg/${discussion.userEmail}`
        );

        listAll(profileImgFolderRef).then((res) => {
          if (res.items.length > 0) {
            getDownloadURL(res.items[0]).then((url) => {
              userImage.src = url;
              userImage.alt = "user image";
            });
          } else {
            userImage.src = "./../media/images/default-profile.png";
            userImage.alt = "Default image";
          }
        });

        const userInfo = document.createElement("div");

        const userName = document.createElement("h3");
        userName.textContent = `${discussion.userFName} ${discussion.userLName}`;

        const dateIconContainer = document.createElement("div");
        dateIconContainer.style.display = "flex";

        const discussionDate = document.createElement("p");
        discussionDate.textContent = discussion.discussionDate;
        discussionDate.style.marginRight = "5px";

        const discussionIcon = document.createElement("img");
        discussionIcon.src = "./../media/icons/icons8-hashtag-64.png";
        discussionIcon.alt = "discussion";
        discussionIcon.classList.add("indicator-icon");

        dateIconContainer.appendChild(discussionDate);
        dateIconContainer.appendChild(discussionIcon);

        userInfo.appendChild(userName);
        userInfo.appendChild(dateIconContainer);

        discussionHeader.appendChild(userImage);
        discussionHeader.appendChild(userInfo);

        const discussionContent = document.createElement("h1");
        discussionContent.classList.add("discussion-content");
        discussionContent.textContent = discussion.discussionContent;

        discussionTopContainer.appendChild(discussionHeader);
        discussionTopContainer.appendChild(discussionContent);

        const discussionBottomContainer = document.createElement("div");
        discussionBottomContainer.classList.add("discussion-bottom-container");

        const discussionCommentContainer = document.createElement("div");
        discussionCommentContainer.classList.add(
          "discussion-comment-container"
        );

        // COMMENTS
        if (discussion.comments) {
          discussion.comments.forEach((comment) => {
            const commentCard = document.createElement("div");
            commentCard.classList.add("discussion-comment-card");

            const commentUserImg = document.createElement("img");
            commentUserImg.classList.add("comment-user-img");

            const commentUserProfileRef = storageRef(
              storage,
              `profileImg/${comment.userEmail}`
            );

            listAll(commentUserProfileRef).then((res) => {
              if (res.items.length > 0) {
                getDownloadURL(res.items[0]).then((url) => {
                  commentUserImg.src = url;
                  commentUserImg.alt = "";
                });
              } else {
                commentUserImg.src = "./../media/images/default-profile.png";
                commentUserImg.alt = "Default image";
              }
            });

            const commentContent = document.createElement("div");
            commentContent.classList.add("discussion-comment-content");

            const commentUserName = document.createElement("h4");
            commentUserName.classList.add("discussion-comment-user-name");
            commentUserName.textContent = `${comment.userFName} ${comment.userLName}`;

            const commentTextContainer = document.createElement("div");
            commentTextContainer.style.display = "flex";
            commentTextContainer.style.alignItems = "center";

            const commentText = document.createElement("p");
            commentText.style.marginRight = "10px";
            commentText.textContent = comment.commentContent;

            const replyIcon = document.createElement("img");
            replyIcon.src = "./../media/icons/icons8-left-2-100.png";
            replyIcon.alt = "reply";

            let replyInpContainer;

            replyIcon.addEventListener("click", () => {
              if (replyInpContainer) {
                replyInpContainer.remove();
                replyInpContainer = null;
              } else {
                replyInpContainer = document.createElement("div");
                replyInpContainer.classList.add("create-inp-container");
                replyInpContainer.style.display = "flex";
                replyInpContainer.style.height = "100px";

                const replyInput = document.createElement("input");
                replyInput.type = "text";
                replyInput.maxLength = "200";
                replyInput.classList.add("discussion-inp-reply");
                replyInput.placeholder = `Reply to ${comment.userFName} ${comment.userLName}`;

                const replySendIcon = document.createElement("img");
                replySendIcon.src = "./../media/icons/icons8-send-64.png";
                replySendIcon.alt = "send";

                replyInpContainer.appendChild(replyInput);
                replyInpContainer.appendChild(replySendIcon);
                commentContent.appendChild(replyInpContainer);

                replySendIcon.addEventListener("click", () => {
                  const replyContent = replyInput.value.trim();

                  if (replyContent) {
                    const replyRef = ref(
                      database,
                      `discussions/${discussion.userId}/${discussion.discussionID}/comments/${comment.commentID}/replies`
                    );
                    const newReplyRef = push(replyRef);
                    const replyID = newReplyRef.key;

                    const newReply = {
                      replyContent: replyContent,
                      userEmail: discussion.userEmail,
                      userFName: discussion.userFName,
                      userLName: discussion.userLName,
                    };

                    set(newReplyRef, newReply);
                  }
                });
              }
            });

            commentTextContainer.appendChild(commentText);
            commentTextContainer.appendChild(replyIcon);

            commentContent.appendChild(commentUserName);
            commentContent.appendChild(commentTextContainer);

            commentCard.appendChild(commentUserImg);
            commentCard.appendChild(commentContent);

            discussionCommentContainer.appendChild(commentCard);

            // REPLIES
            if (comment.replies) {
              comment.replies.forEach((reply) => {
                const replyCard = document.createElement("div");
                replyCard.classList.add("discussion-reply-card");

                const replyUserProfile = document.createElement("img");
                replyUserProfile.style.objectFit = "cover";
                replyUserProfile.style.objectPosition = "center";

                const replyUserProfileRef = storageRef(
                  storage,
                  `profileImg/${comment.userEmail}`
                );

                listAll(replyUserProfileRef).then((res) => {
                  if (res.items.length > 0) {
                    getDownloadURL(res.items[0]).then((url) => {
                      replyUserProfile.src = url;
                      replyUserProfile.alt = "";
                    });
                  } else {
                    replyUserProfile.src =
                      "./../media/images/default-profile.png";
                    replyUserProfile.alt = "Default image";
                  }
                });

                const discussionReplyContent = document.createElement("div");
                discussionReplyContent.classList.add(
                  "discussion-reply-content"
                );

                const replyUserName = document.createElement("h4");
                replyUserName.classList.add("discussion-reply-user-name");
                replyUserName.textContent = `${reply.userFName} ${reply.userLName}`;

                const replyText = document.createElement("p");
                replyText.textContent = reply.replyContent;

                discussionReplyContent.appendChild(replyUserName);
                discussionReplyContent.appendChild(replyText);

                replyCard.appendChild(replyUserProfile);
                replyCard.appendChild(discussionReplyContent);

                discussionCommentContainer.appendChild(replyCard);
              });
            }
          });
        }
        // COMMENTS END

        discussionBottomContainer.appendChild(discussionCommentContainer);

        const discussionFooter = document.createElement("div");
        discussionFooter.classList.add("discussion-footer");

        const commentInputContainer = document.createElement("div");

        const commentInput = document.createElement("input");
        commentInput.type = "text";
        commentInput.classList.add("discussion-inp-comment");
        commentInput.placeholder = "Add comment";

        const sendIcon = document.createElement("img");
        sendIcon.src = "./../media/icons/icons8-send-32.png";
        sendIcon.alt = "send";

        sendIcon.addEventListener("click", () => {
          const commentInpContent = commentInput.value.trim();

          if (commentInpContent) {
            const commentRef = ref(
              database,
              `discussions/${discussion.userId}/${discussion.discussionID}/comments`
            );
            const newCommentRef = push(commentRef);
            const commentID = newCommentRef.key;

            const newComment = {
              commentContent: commentInpContent,
              userEmail: discussion.userEmail,
              userFName: discussion.userFName,
              userLName: discussion.userLName,
            };

            set(newCommentRef, newComment);
          }
        });

        commentInputContainer.appendChild(commentInput);
        commentInputContainer.appendChild(sendIcon);

        const discussionActions = document.createElement("div");
        discussionActions.classList.add("discussion-actions");

        const commentIcon = document.createElement("img");
        commentIcon.src = "./../media/icons/icons8-comment-96.png";
        commentIcon.alt = "comment";
        commentIcon.classList.add("comment-img");
        commentIcon.dataset.index = index;

        const commentLabel = document.createElement("label");
        commentLabel.htmlFor = "comment-img";
        commentLabel.textContent = discussion.comments.reduce(
          (total, comment) =>
            total + 1 + (comment.replies ? comment.replies.length : 0),
          0
        );

        // HEART REACTS
        const heartIconFooter = document.createElement("img");
        heartIconFooter.src =
          discussion.reactsUsers && userID && discussion.reactsUsers[userID]
            ? "./../media/icons/icons8-heart-50-red.png"
            : "./../media/icons/icons8-heart-50.png";
        heartIconFooter.alt = "heart";
        heartIconFooter.id = "heart-img";

        const heartLabel = document.createElement("label");
        heartLabel.textContent = discussion.discussionReacts;
        heartLabel.htmlFor = "heart-img";

        heartIconFooter.addEventListener("click", () => {
          if (!userID) {
            alert("Please log in to react to posts.");
            return;
          }

          const discussionRef = ref(
            database,
            `discussions/${discussion.userId}/${discussion.discussionID}`
          );

          get(discussionRef).then((snapshot) => {
            const discussionData = snapshot.val();
            const reactsUsers = discussionData.reactsUsers || {};
            const hasReacted = !!reactsUsers[userID];

            if (hasReacted) {
              discussionData.discussionReacts =
                discussionData.discussionReacts - 1;
              delete reactsUsers[userID];
            } else {
              discussionData.discussionReacts =
                discussionData.discussionReacts + 1;
              reactsUsers[userID] = true;
            }

            discussionData.reactsUsers = reactsUsers;

            set(discussionRef, discussionData).then(() => {
              heartIconFooter.src = hasReacted
                ? "./../media/icons/icons8-heart-50.png"
                : "./../media/icons/icons8-heart-50-red.png";
              heartLabel.textContent = discussionData.discussionReacts;
            });
          });
        });
        // HEART REACTS END

        discussionActions.appendChild(commentIcon);
        discussionActions.appendChild(commentLabel);
        discussionActions.appendChild(heartIconFooter);
        discussionActions.appendChild(heartLabel);

        discussionFooter.appendChild(commentInputContainer);
        discussionFooter.appendChild(discussionActions);

        discussionBottomContainer.appendChild(discussionFooter);

        discussionBodyContainer.appendChild(discussionTopContainer);
        discussionBodyContainer.appendChild(discussionBottomContainer);

        discussionCardContainer.appendChild(discussionBodyContainer);
      });

      document.querySelectorAll(".comment-img").forEach((commentIcon) => {
        commentIcon.addEventListener("click", displayComments);
      });
    });
  };

  // displayDiscussions();
  // DISPLAY DISCUSSIONS END =========================================================================================================================

  const btnNewsfeed = document.querySelector(".btn-newsfeed");
  const btnBlogs = document.querySelector(".btn-blogs");
  const btnDiscussion = document.querySelector(".btn-discussion-board");

  const handleNewsfeed = () => {
    const newsfeed = localStorage.getItem("newsfeed") || "";

    if (newsfeed === "blogs") {
      const discussionCardContainer = document.querySelector(
        ".discussion-card-container"
      );
      discussionCardContainer.innerHTML = "";
      btnNewsfeed.style.textDecoration = "none";
      btnDiscussion.style.textDecoration = "none";
      btnBlogs.style.textDecoration = "underline";
      displayBlogs();
    } else if (newsfeed === "discussions") {
      const cardContainer = document.querySelector(".card-container");
      cardContainer.innerHTML = "";
      btnNewsfeed.style.textDecoration = "none";
      btnBlogs.style.textDecoration = "none";
      btnDiscussion.style.textDecoration = "underline";
      displayDiscussions();
    } else {
      btnBlogs.style.textDecoration = "none";
      btnDiscussion.style.textDecoration = "none";
      btnNewsfeed.style.textDecoration = "underline";
      displayBlogs();
      displayDiscussions();
    }
  };

  handleNewsfeed();

  btnNewsfeed.addEventListener("click", () => {
    localStorage.setItem("newsfeed", "newsfeed");
    handleNewsfeed();
  });

  btnBlogs.addEventListener("click", () => {
    localStorage.setItem("newsfeed", "blogs");
    handleNewsfeed();
  });

  btnDiscussion.addEventListener("click", () => {
    localStorage.setItem("newsfeed", "discussions");
    handleNewsfeed();
  });
});

// INSERT BUTTON NAV =================================================================================================================================
document.addEventListener("DOMContentLoaded", () => {
  const insertButtonNav = () => {
    const newPostContainer = document.querySelector(".insert-post-container");
    const newDiscussionContainer = document.querySelector(
      ".discussion-post-container"
    );

    const imageInput = document.querySelector(".inp-insert-img-post");
    const postContent = document.querySelector(".inp-insert-post");

    document.querySelector(".btn-add-blog").addEventListener("click", () => {
      newPostContainer.style.display = "block";
      imageInput.value = "";
      postContent.value = "";
    });

    document
      .querySelector(".insert-post-container .btn-post-close")
      .addEventListener("click", () => {
        newPostContainer.style.display = "none";
      });

    document
      .querySelector(".add-container .btn-add-discussion")
      .addEventListener("click", () => {
        newDiscussionContainer.style.display = "block";
      });

    document
      .querySelector(".discussion-post-container .btn-post-close")
      .addEventListener("click", () => {
        newDiscussionContainer.style.display = "none";
      });

    document.querySelector(".btn-add").addEventListener("click", () => {
      document.querySelector(".add-btn-container").classList.toggle("active");
    });
  };

  insertButtonNav();
});
// INSERT BUTTON NAV END =================================================================================================================================

document.addEventListener("headerLoaded", () => {
  const btnNav = document.querySelector(".menu-nav .btn-community");
  btnNav.style.background = "rgba(0, 0, 0, 0.5)";
  btnNav.style.color = "white";
  document.querySelector(".header-nav .btn-community").style.textDecoration =
    "underline";
});
