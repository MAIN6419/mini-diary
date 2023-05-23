// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
import {
  arrayRemove,
  arrayUnion,
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  limit,
  getDoc,
  onSnapshot,
  increment,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import {
  uploadBytes,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  browserSessionPersistence,
  setPersistence,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

const userData = JSON.parse(sessionStorage.getItem("userData"));
let baseUrl = "";
const host = window.location.host;
if (host.includes("github.io")) {
  baseUrl = "/mini-diary";
}

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnaqMLR9z8naAC0J06ptfd6HQb1jSnSbY",
  authDomain: "mini-diary-65ff3.firebaseapp.com",
  projectId: "mini-diary-65ff3",
  storageBucket: "mini-diary-65ff3.appspot.com",
  messagingSenderId: "407798731197",
  appId: "1:407798731197:web:130b483a33ace812bdc2d4",
  measurementId: "G-NZGRQDDVH2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// const analytics = getAnalytics(app);

// 다이어리 목록을 불러오는 함수
async function FetchDiarys() {
  try {
    const diaryList = collection(db, "diaryList");
    const q = query(
      diaryList,
      where("auth", "==", currentUser.displayName),
      orderBy("createdAt", "desc"),
      limit(4)
    );
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    return datas;
  } catch (error) {
    throw error;
  }
}
async function getAuthImg(auth) {
  const userRef = doc(db, "user", auth);
  const res = await getDoc(userRef);
  const datas = res.data();
  return datas.profileImgUrl;
}
async function fetchRecentDiary() {
  try {
    const diaryList = collection(db, "diaryList");
    const q = query(diaryList, limit(4));
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    return datas;
  } catch (error) {
    throw error;
  }
}

async function fetchAllDiarys() {
  try {
    const diaryList = collection(db, "diaryList");
    const res = await getDocs(diaryList);
    const datas = res.docs.map((el) => el.data());
    return datas;
  } catch (error) {
    throw error;
  }
}
async function fetchBestDiarys() {
  try {
    const diaryList = collection(db, "diaryList");
    const q = query(diaryList, orderBy("empathy", "desc"), limit(3));
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    return datas;
  } catch (error) {
    throw error;
  }
}

// 현재 페이지의 다이어리를 불러오는 함수
async function FetchDiary(id) {
  try {
    const diaryList = collection(db, "diaryList");
    const q = query(diaryList, where("id", "==", id));
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    return datas[0];
  } catch (error) {
    throw error;
  }
}

async function editDiary(id, { title, contents, imgURL, imgFileName }) {
  try {
    const updateDiary = doc(db, `diaryList/${id}`);
    await updateDoc(updateDiary, { title, contents, imgURL, imgFileName });
    alert("수정이 완료되었습니다.");
  } catch (error) {
    throw error;
  }
}

async function deleteDiary(id) {
  try {
    const diary = await FetchDiary(id);
    if (diary.imgFileName.length) {
      for (let i = 0; i < diary.imgFileName.length; i++) {
        await deleteObject(
          storageRef(storage, `images/diary/${String(diary.imgFileName[i])}`)
        );
      }
    }
    // 삭제되는 게시글의 공감 버튼을 누른 유저의 공감목록에서 삭제
    const userCollection = collection(db, "user");
    const querySnapshot = await getDocs(userCollection);
    // 비동기 처리를 위해 for of문을 사용
    for (const docs of querySnapshot.docs) {
      await updateDoc(doc(db, "user", docs.id), {
        empathyList: arrayRemove(id),
      });
    }

    await deleteDoc(doc(db, `diaryList/${id}`));
    await updateDoc(doc(db, "user", userData.nickname), {
      diaryCount: increment(-1),
    });
  } catch (error) {
    throw error;
  }
}

async function writeComment(commentData) {
  try {
    const commentRef = collection(db, "comment");
    await setDoc(doc(commentRef, commentData.commentId), {
      ...commentData,
    });

    // // 데이터가 추가될 때마다 실시간으로 업데이트
    // const queryRef = query(commentRef, where("diaryId", "==", commentData.diaryId));
    // onSnapshot(queryRef, (snapshot) => {
    //   const updatedData = snapshot.docs.map((doc) => doc.data());

    // });
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}
async function fetchComment(id) {
  try {
    const commentRef = collection(db, `comment`);
    const q = query(commentRef, where("diaryId", "==", id));
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    return datas;
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

// // 대댓글 가져오기 함수
// // fetchReplyComment 함수 정의
// async function fetchReplyComment(commentId) {
//   // 부모 컬렉션과 문서의 참조
// const parentCollectionRef = collection(db, "comment");
// const parentDocRef = doc(parentCollectionRef, commentId);

// // 중첩 컬렉션의 참조
// const childCollectionRef = collection(parentDocRef, "replyComment");
//   // 대댓글을 가져오기 위한 쿼리 작성
//   const commentDocSnapshot = await getDoc(childCollectionRef);
//   const querySnapshot = await getDocs(commentDocSnapshot);
//   querySnapshot.forEach((doc) => {
//     replyComments.push(doc.data());
//   });
//   return replyComments;
// }

async function deleteComment(id) {
  try {
    await deleteDoc(doc(db, `comment/${id}`));
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

async function editComment(id, content) {
  try {
    await updateDoc(doc(db, `comment/${id}`), {
      content,
    });
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

async function writeReplyComment(newReply, parentCommentId) {
  const commentsCollection = collection(db, "comment");
  const parentCommentRef = doc(commentsCollection, parentCommentId);
  const replyCommentRef = collection(parentCommentRef, "replyComment");
  await setDoc(doc(replyCommentRef, newReply.commentId), {
    ...newReply,
  });
}

async function deleteReplyComment(replyCommentId, parentCommentId) {
  const commentsCollection = collection(db, "comment");
  const parentCommentRef = doc(commentsCollection, parentCommentId);
  const replyCommentRef = collection(parentCommentRef, "replyComment");
  const deleteReplyRef = doc(replyCommentRef, replyCommentId);

  await deleteDoc(deleteReplyRef);
}

async function editReplyComment(replyCommentId, parentCommentId, content) {
  const commentsCollection = collection(db, "comment");
  const parentCommentRef = doc(commentsCollection, parentCommentId);
  const replyCommentRef = collection(parentCommentRef, "replyComment");
  const updateReplyRef = doc(replyCommentRef, replyCommentId);

  await updateDoc(updateReplyRef, {
    content,
  });
}

async function fetchReplyComments(parentCommentId) {
  const parentCommentRef = doc(db, "comment", parentCommentId);
  const replyCommentsRef = collection(parentCommentRef, "replyComment");

  const q = query(replyCommentsRef);

  const querySnapshot = await getDocs(q);
  const replyComments = [];

  querySnapshot.forEach((doc) => {
    replyComments.push(doc.data());
  });

  return replyComments;
}
async function deleteChat(chatRoomId, id) {
  try {
    await updateDoc(doc(db, `chat${chatRoomId}/${id}`), {
      message: "삭제된 메세지 입니다.",
      type: "delete",
    });
  } catch (error) {
    throw error;
  }
}
// 다이어리 추가 함수
async function writeDiary(newDiary) {
  try {
    const diaryList = collection(db, "diaryList");
    await setDoc(doc(diaryList, newDiary.id), {
      ...newDiary,
    });
    await updateDoc(doc(db, "user", userData.nickname), {
      diaryCount: increment(1),
      point: increment(1),
    });
    alert("등록이 완료되었습니다.");
  } catch (error) {
    throw error;
  }
}

// 이미지 업로드 함수
async function uploadFile(files) {
  try {
    const fileInfo = { url: [], fileName: [] };
    for (const file of files) {
      if (file) {
        const fileName = uuidv4() + "_" + file.name;
        const res = await uploadBytes(
          storageRef(storage, `images/diary/${fileName}`),
          file
        );
        const uploadfileUrl = await getDownloadURL(res.ref);
        fileInfo.url.push(uploadfileUrl);
        fileInfo.fileName.push(fileName);
      }
    }
    return fileInfo;
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

async function deleteEditDiaryImg(filename) {
  // 빈배열이 올 수 있기 때문에 filename이 있는 경우에만 이미지 삭제 처리
  try {
    if (filename) {
      await deleteObject(
        storageRef(storage, `images/diary/${String(filename)}`)
      );
    }
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

async function updateEmpathy(id, count) {
  try {
    const diary = doc(db, `diaryList/${id}`);
    if (!diary) return;
    const user = doc(db, `user/${currentUser.displayName}`);
    await updateDoc(diary, { empathy: increment(count) });
    if (count > 0) {
      await updateDoc(user, { empathyList: arrayUnion(id) });
    } else {
      await updateDoc(user, { empathyList: arrayRemove(id) });
    }
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

const auth = getAuth();
let currentUser;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("유저상태 변경");
    // await updateDoc(userDocRef, { islogin: false });
  } else {
    currentUser = user;
  }
});

const FetchUserData = async (nickname) => {
  try {
    const userRef = collection(db, "user");
    const q = query(userRef, where("nickname", "==", nickname));
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    return datas[0];
  } catch (error) {
    throw error;
  }
};

// 유저 프로필 이미지 변경 함수
const updateProfileImg = async (url) => {
  try {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, {
      photoURL: url,
    });
    const updateUser = doc(getFirestore(app), `user/${userData.nickname}`);
    await updateDoc(updateUser, { profileImgUrl: url });
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
};

export async function checkLogin(nickname) {
  try {
    const userDocRef = doc(db, "user", nickname);
    // islogin이 바뀔때 마다 감지를 위해 실시간 데이터베이스 사용
    onSnapshot(userDocRef, async (doc) => {
      const data = doc.data();
      if (!data.islogin) {
        await signOut(auth);
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("diaryData");
        location.replace(`${baseUrl}/`);
      }
      if (data.point >= 100 && data.grade === "일반") {
        await updateDoc(doc.ref, { grade: "우수" });
        alert("축하합니다! 우수 등급으로 등업되었습니다!");
      } else if(data.point >= 500 && data.grade === "우수") {
        await updateDoc(doc.ref, { grade: "프로" });
        alert("축하합니다! 프로 등급으로 등업되었습니다!");
      } else if(data.point >= 1000 && data.grade === "프로") {
        alert("축하합니다! VIP 등급으로 등업되었습니다!");
      }
    });
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

const login = async (email, password) => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    // 로그인 유저 데이터를 불러와 세션스토리지에 저장하기 위해
    const userRef = collection(db, "user");
    const q = query(userRef, where("email", "==", email));
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    const userDocRef = doc(db, "user", datas[0].nickname);

    if (datas[0].islogin) {
      const login = confirm(
        "이미 로그인된 계정 입니다! 기존 계정을 로그아웃 하시겠습니까?"
      );
      if (login) {
        // 기존 로그인된 계정을 로그아웃 시킨다.
        await updateDoc(userDocRef, { islogin: false });
      } else {
        return;
      }
    }
    // 로그인이 확인 처리
    await updateDoc(userDocRef, { islogin: true });

    //불러온 데이터 세션 스토리지에 저장
    sessionStorage.setItem(
      "userData",
      JSON.stringify({
        nickname: datas[0].nickname,
        introduce: datas[0].introduce,
        profileImgURL: datas[0].profileImgUrl,
        fortune: datas[0].fortune,
      })
    );
    location.replace(`${baseUrl}/src/template/home.html`);
  } catch (error) {
    if (error.message.includes("auth/invalid-email")) {
      alert("유효하지 않은 이메일 형식 입니다!");
    } else if (error.message.includes("auth/user-not-found")) {
      alert("일치 하는 로그인 정보가 없습니다!");
      return;
    } else if (error.message.includes("auth/wrong-password")) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    } else if (error.message.includes("auth/too-many-requests")) {
      alert("많은 로그인 시도로 인해 로그인이 일시적으로 제한됩니다! ");
    } else {
      alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
      throw error;
    }
  }
};

const logout = async () => {
  if (confirm("정말 로그아웃 하시겠습니까?")) {
    try {
      // 채팅방에 입장했다는 알기 위해 url를 구해줌
      const url = window.location.href;
      const urlParams = new URLSearchParams(window.location.search);
      // 현재 채팅창의 querystring Id값을 가져옴
      const chatRoomId = urlParams.get("id");
      const userDocRef = doc(db, "user", userData.nickname);
      // 로그아웃
      await signOut(auth);
      // 채팅방 퇴장 처리
      // 로그아웃시 만약 현재 url이 채팅방페이지 url에 있었다면 db에 채팅창에 유저 데이터를 지우고 퇴장처리한다.
      // 만약 이 분기점이 없다면 로그아웃마다 db에 유저데이터를 지우려고 하려는데 유저가 채팅방에 입장하지 않았기 때문에 채팅방 db에 해당유저 데이터가 없는데 지우려고 하기 때문에 오류가 발생한다.

      if (chatRoomId && url.includes("chatting")) {
        // 현재 채팅방 번호를 구해줌
        // 채팅방 데이터를 구해줌
        const chatRoomRef = doc(db, `chatRoom/${chatRoomId}`);
        await updateDoc(chatRoomRef, {
          users: arrayRemove(userData.nickname), // users 배열에서 userNickname 제거
        });
      }

      // 유저 DB 로그아웃 변경
      // 위에 한번 다른 값으로 바꿔주지 않으면 이거 그냥 안바뀌고 그냥 넘어감
      await updateDoc(userDocRef, { islogin: true });
      await updateDoc(userDocRef, { islogin: false });
      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("diaryData");
      location.replace("/");
    } catch (error) {
      alert("알 수 없는 에러가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
      throw error;
    }
  }
};

// 회원가입시 정보 중복검사를 처리하는 함수
// duplicationValue는 중복처리검사할 값, duplicationTarget 현재 비교할 DB에서의 key값
const duplication = async (duplicationValue, duplicationTarget) => {
  const userRef = collection(getFirestore(app), "user");
  const q = query(
    userRef,
    where(duplicationTarget, "==", duplicationValue.toLowerCase())
  );
  const res = await getDocs(q);
  const data = res.docs.map((el) => el.data());
  // 만약에 중복된 데이터가 존재한다면 data 배열에 값이 담겨서 length가 0보다 크므로
  if (data.length > 0) {
    return true;
  } else {
    return false;
  }
};

async function changeUserPassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    // 현재 사용자의 정보를 확인하는 메서드
    // => 이것을 이용하여 현재 로그인한 유저의 비밀번화 일치하는지 판변해서
    // 일치하지 않는다면 오류가 발생하는데 이것을 예외처리해서
    // 비밀번호가 일치하지 않는다는 것을 판별
    await reauthenticateWithCredential(user, credential);
    if (currentPassword === newPassword) {
      alert("현재 비밀번호와 새 비밀번호가 같습니다!");
      return false;
    }
    await updatePassword(auth.currentUser, newPassword);
    alert("비밀번호가 변경되었습니다.");
  } catch (error) {
    if (error.message.includes("auth/wrong-password")) {
      alert("현재 비밀번호가 일치하지 않습니다!");
      return;
    } else {
      throw error;
    }
  }
}

// sessionStorage에 저장된 user의 닉네임을 가져오기 위한 함수
const getSessionUser = () => {
  for (const key of Object.keys(sessionStorage)) {
    if (key.includes("firebase:authUser:")) {
      return JSON.parse(sessionStorage.getItem(key));
    }
  }
};

// 휴대폰 인증 로직
// auth.languageCode = "ko";
// const $btnAuth = document.getElementById("btn-authentication");
// window.recaptchaVerifier = new RecaptchaVerifier(
//   "btn-authentication",
//   {
//     size: "invisible",
//     callback: (response) => {
//       // reCAPTCHA solved, allow signInWithPhoneNumber.
//       onSignInSubmit();
//     },
//   },
//   auth
// );

// $btnAuth.addEventListener("click", () => {
//   const phoneNumber = document.querySelector("#input-phone").value;
//   const appVerifier = window.recaptchaVerifier;
//   signInWithPhoneNumber(auth, "+82" + phoneNumber, appVerifier)
//     .then((confirmationResult) => {
//       alert("인증코드가 발송되었습니다.");
//       // SMS sent. Prompt user to type the code from the message, then sign the
//       // user in with confirmationResult.confirm(code).
//       window.confirmationResult = confirmationResult;
//       console.log(confirmationResult)
//       // ...
//     })
//     .catch((error) => {
//       console.log(error)
//       // Error; SMS not sent
//       // ...
//     });
// });
// const $btnCode = document.getElementById("btn-code");
// $btnCode.addEventListener("click", ()=>{
//   const code = document.getElementById('input-code').value;
//   confirmationResult.confirm(code).then((result) => {
//     // User signed in successfully.
//     const user = result.user;
//     console.log(result);
//     alert('인증이 완료되었습니다.')
//     // ...
//   }).catch((error) => {
//     console.log(error);
//     // User couldn't sign in (bad verification code?)
//     // ...
//   });
// })

// 회원가입을 위한 함수
// 인자로 닉네임 이메일 비밀번호를 받는다.
// createUserWithEmailAndPassword 아이디를 생성하는 api 함수
// updateProfile 해당 유저의 프로필 정보를 업데이트해주는 함수 => 생성된 유저 정보를 반환해줌
// 여기서 사용된 이유는 현재 유저의 닉네임을 넣어주기 위해서 displayNmae이 설정할 닉네임이 된다.
const signup = async ({ nickname, email, phone, password }) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, {
      displayName: nickname,
    });

    const user = collection(db, "user");
    await setDoc(doc(user, `${res.user.displayName ?? ""}`), {
      email: res.user.email,
      nickname: res.user.displayName,
      phone,
      profileImgFileName: "",
      profileImgUrl: "",
      fortune: "",
      introduce: "소개글을 작성하지 않았습니다.",
      point: 0,
      commentCount: 0,
      diaryCount: 0,
      grade: "일반",
      empathyList: [],
    });

    alert("회원가입이 완료되었습니다.");
    location.replace(`${baseUrl}/`);
  } catch (error) {
    if (error.message.includes("email-already-in-use")) {
      prompt("이미 사용중인 이메일 입니다!");
    } else {
      alert("알 수 없는 에러가 발생하였습니다. 잠시후 다시 시도해 주세요.");
    }
    throw error;
  }
};

const findEmail = async (nickname, phone) => {
  try {
    const userRef = collection(db, "user");
    const q = query(
      userRef,
      where("nickname", "==", nickname),
      where("phone", "==", phone)
    );
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    if (datas.length > 0) return datas[0].email;
    else {
      alert("일치하는 정보가 없습니다!");
      return false;
    }
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시후 다시 시도해 주세요.");
    throw error;
  }
};

const changePassword = async (email, phone) => {
  try {
    const userRef = collection(db, "user");
    const q = query(
      userRef,
      where("email", "==", email),
      where("phone", "==", phone)
    );
    const res = await getDocs(q);
    const datas = res.docs.map((el) => el.data());
    if (datas.length > 0) {
      sendPasswordResetEmail(auth, email)
        .then(() => {})
        .catch((error) => {
          throw error;
        });
      return true;
    } else {
      alert("일치하는 정보가 없습니다!");
      return false;
    }
  } catch (error) {
    alert("알 수 없는 에러가 발생하였습니다. 잠시후 다시 시도해 주세요.");
    throw error;
  }
};

let isfirst = true;
let timer = null;
let currentSnapshotUnsubscribe;

const joinChatRoom = async (chatRoomId, userNickname, renderJoinUser) => {
  if (!chatRoomId) {
    alert("잘못된 경로입니다!");
    return location.replace("chattingRoom.html");
  }

  try {
    const chatRoomRef = doc(db, "chatRoom", chatRoomId);
    const res = await getDoc(chatRoomRef);
    const data = res.data();

    if (!data) {
      alert("삭제되거나 존재하지 않는 채팅방입니다!");
      return location.replace("chattingRoom.html");
    }

    if (data.users.length >= data.limit) {
      alert("입장 가능한 인원을 초과하였습니다!");
      return location.replace("chattingRoom.html");
    }

    await updateDoc(chatRoomRef, {
      users: arrayUnion(userNickname),
    });

    currentSnapshotUnsubscribe = onSnapshot(chatRoomRef, async (snapshot) => {
      try {
        const data = snapshot.data();

        if (!data) {
          console.log("Data is undefined.");
          return;
        }

        renderJoinUser(data);
        isfirst = false;
      } catch (error) {
        console.log(error);
      }
    });

    window.addEventListener("beforeunload", async (event) => {
      if (!isfirst) {
        await updateDoc(chatRoomRef, {
          users: arrayRemove(userNickname),
        });
      }
    });
  } catch (error) {
    if (error.message.includes("No document to update")) {
      alert("삭제되거나 존재하지 않는 채팅방입니다!");
      location.replace("chattingRoom.html");
    }
  }
};

function fetchChatting($chattingBox, chatRoomId, renderChattingMsg) {
  const chatRef = collection(db, `chat${chatRoomId}`);
  const q = query(chatRef, orderBy("createdAt", "asc"));
  let prevDate = null; // 이전 메시지의 작성 날짜를 저장할 변수
  onSnapshot(q, (querySnapshot) => {
    $chattingBox.innerHTML = ""; // 채팅 리스트 초기화
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const currentDate = new Date(data.createdAt);
      renderChattingMsg(data);
    });
  
  });
}

async function createChattingRoom({
  id,
  title,
  limit,
  isprivate,
  password,
  createdAt,
}) {
  const chatRoomRef = collection(db, "chatRoom");
  await setDoc(doc(chatRoomRef, id), {
    id,
    title,
    limit,
    users: [],
    isprivate,
    password,
    createdAt,
  });
  location.href = `${baseUrl}/src/template/chatting.html?id=${id}`;
}

async function fetchChattingRoom() {
  const chatRoomRef = collection(db, "chatRoom");
  const q = query(chatRoomRef, orderBy("createdAt", "desc"));
  return new Promise((resolve, reject) => {
    onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map((el) => el.data());
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function getTotalpage() {
  const chatRoomRef = collection(db, "chatRoom");
  const res = await getDocs(chatRoomRef);
  return res.docs.length;
}

async function addChatting(chatRoomId, newChat) {
  const chatRef = collection(db, "chat" + chatRoomId);
  try {
    // Firestore에 새로운 메시지 추가
    await setDoc(doc(chatRef, newChat.id), {
      id: newChat.id,
      message: newChat.message,
      user: newChat.user,
      createdAt: newChat.createdAt,
      type: "added",
    });
  } catch (error) {
    alert("알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

async function checkJoinRoom(chatRoomId) {
  try {
    const roomRef = doc(db, `chatRoom/${chatRoomId}`);
    const res = await getDoc(roomRef);
    const data = res.data();
    return data;
  } catch (error) {
    throw error;
  }
}

async function editIntroduce(introduce) {
  try {
    const userRef = doc(db, `user/${userData.nickname}`);
    await updateDoc(userRef, { introduce });
  } catch (error) {
    alert("알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    throw error;
  }
}

const applyProfileImg = async (file) => {
  if (file) {
    try {
      const fileName = `${uuidv4()}_${file.name}`;
      const res = await uploadBytes(
        storageRef(storage, `images/profile/${fileName}`),
        file
      );
      const uploadfileUrl = await getDownloadURL(res.ref);
      await updateProfileImg(uploadfileUrl);
      const user = await FetchUserData(userData.nickname);
      if (user.profileImgFileName) {
        await deleteObject(
          storageRef(
            storage,
            `images/profile/${String(user.profileImgFileName)}`
          )
        );
      }

      const updateUser = doc(getFirestore(app), `user/${userData.nickname}`);
      await updateDoc(updateUser, { profileImgFileName: fileName });
      userData.profileImgURL = uploadfileUrl;
      sessionStorage.setItem("userData", JSON.stringify(userData));
      location.reload();
      alert("프로필 이미지가 변경되었습니다.");
    } catch (error) {
      alert("알 수 없는 오류가 발생하였습니다. 잠시 후 다시 시도해주세요.");
      throw error;
    }
  }
};

const setFortune = async (nickname, fortune) => {
  const updateUser = doc(db, `user/${nickname}`);
  await updateDoc(updateUser, { fortune: fortune });
};

export {
  FetchDiarys,
  FetchDiary,
  FetchUserData,
  uploadFile,
  signup,
  login,
  logout,
  changePassword,
  changeUserPassword,
  getSessionUser,
  duplication,
  writeDiary,
  setFortune,
  findEmail,
  editDiary,
  deleteDiary,
  updateEmpathy,
  fetchChatting,
  addChatting,
  joinChatRoom,
  deleteChat,
  createChattingRoom,
  checkJoinRoom,
  editIntroduce,
  applyProfileImg,
  deleteEditDiaryImg,
  fetchAllDiarys,
  fetchBestDiarys,
  fetchRecentDiary,
  writeComment,
  fetchComment,
  deleteComment,
  editComment,
  writeReplyComment,
  // fetchReplyComment,
  fetchReplyComments,
  deleteReplyComment,
  editReplyComment,
  getAuthImg,
  fetchChattingRoom,
  getTotalpage,
  timer,
  setDoc,
  getDoc,
  doc,
  collection,
  db,
  app,
  query,
  orderBy,
  onSnapshot,
  currentUser,
};
