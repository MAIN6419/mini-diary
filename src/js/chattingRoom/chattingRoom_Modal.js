import { v4 as uuidv4 } from "uuid";;
import { createChattingRoom, checkJoinRoom } from "../firebase/chattingRoom/firebase_chattingRoom.js";
import { keyBoardFocutOPT } from "../commons/libray.js";

const $sectionContents = document.querySelector(".section-contents");

// createRoom 모달창 

const $createRoomModalBtn = $sectionContents.querySelector( ".btn-createRoomModal");
const $createRoomModal = $sectionContents.querySelector(".createRoom-modal");
const $createRoomModalDim = $createRoomModal.querySelector(".dim");
const $inputTitle = $createRoomModal.querySelector("#input-title");
const $inputLimit = $createRoomModal.querySelector("#input-limit");
const $chkPriavte = $createRoomModal.querySelector("#checkbox-private");
const $inputPassowrd = $createRoomModal.querySelector("#input-password");
const $createRoomBtn = $sectionContents.querySelector(".btn-createRoom");
const $createRoomCloseBtn = $createRoomModal.querySelector(".btn-close");

$createRoomBtn.addEventListener("click", (e) => {
  e.preventDefault();
  $createRoomModal.classList.add("active");
  if (!$inputTitle.value.trim()) {
    alert("제목을 입력해주세요!");
    return;
  }
  if (!$inputLimit.value) {
    alert("최대 인원수 입력해주세요!");
    return;
  }
  if ($chkPriavte.checked) {
    if (!$inputPassowrd.value) {
      alert("비밀번호를 입력해주세요!");
      return;
    } else if ($inputPassowrd.value < 4) {
      alert("비밀번호는 최소 4자리 이상입니다!");
      return;
    }
  }
  const newRoom = {
    id: uuidv4(),
    title: $inputTitle.value,
    limit: parseInt($inputLimit.value),
    isprivate: $chkPriavte.checked,
    password: $inputPassowrd.value || "",
    createdAt: new Date().getTime(),
  };
  createChattingRoom(newRoom);

  $inputPassowrd.value = "";
  $inputLimit.value = "";
  $inputTitle.value = "";
  $createRoomModal.classList.remove("active");
});

$createRoomModalBtn.addEventListener("click", () => {
  $createRoomModal.classList.add("active");
  $inputTitle.focus();
});
$createRoomModalDim.addEventListener("click", () => {
  $createRoomCloseBtn.click();
});
$createRoomCloseBtn.addEventListener("click", () => {
  $createRoomModal.classList.remove("active");
  $inputTitle.value = "";
  $inputPassowrd.value = "";
  $inputLimit.value = "";
  $chkPriavte.checked = false;
  $inputPassowrd.classList.remove("active");
});
$inputTitle.addEventListener("keydown", (e) => {
  keyBoardFocutOPT(e,$createRoomCloseBtn);
  if (e.keyCode === 32 && !e.target.value.trim()) {
    e.preventDefault();
    e.target.value = "";
  }
});
$createRoomCloseBtn.addEventListener("keydown", (e) => keyBoardFocutOPT(e, $createRoomBtn,$inputTitle));

$inputPassowrd.addEventListener("input", (e) => {
  e.target.value = e.target.value.trim();
});

$inputLimit.addEventListener("change", (e) => {
  if (e.target.value > 10) {
    e.target.value = 10;
  } else if (e.target.value < 2) {
    e.target.value = 2;
  }
});

$chkPriavte.addEventListener("change", () => {
  $inputPassowrd.classList.toggle("active");
});

// joinRoom 모달창 
const $joinRoomModalBtn = $sectionContents.querySelector(".btn-joinRoomModal");
const $joinRoomModal = $sectionContents.querySelector(".joinRoom-modal");
const $joinRoomModalDim = $joinRoomModal.querySelector(".dim");
const $inputRoomId = $joinRoomModal.querySelector("#input-roomId");
const $joinRoomCloseBtn = $joinRoomModal.querySelector(".btn-close");
const $joinRoomBtn = $joinRoomModal.querySelector(".btn-join");


$joinRoomModalBtn.addEventListener("click", () => {
  $joinRoomModal.classList.add("active");
  $inputRoomId.focus();
});
$joinRoomModalDim.addEventListener("click", () => {
  $joinRoomCloseBtn.click();
});
$inputRoomId.addEventListener("input", (e) => {
  e.target.value = e.target.value.trim();
});
$joinRoomCloseBtn.addEventListener("click", () => {
  $joinRoomModal.classList.remove("active");
  $inputRoomId.value = "";
});
$joinRoomBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  if (!$inputRoomId.value) {
    alert("입장할 채팅방 id를 입력해주세요.");
    return;
  }
  const res = await checkJoinRoom($inputRoomId.value);
  if (res) {
    if (res.isprivate) {
      modalPrompt(res);
    } else {
      location.href = `chatting.html?id=${res.id}`;
    }
  } else {
    alert("존재하지 않는 채팅방입니다!");
    $inputRoomId.value = "";
  }
});

$inputRoomId.addEventListener("keydown", (e) => {
  keyBoardFocutOPT(e, $joinRoomCloseBtn);
  if (e.keyCode === 32 && !e.target.value.trim()) {
    e.preventDefault();
    e.target.value = "";
  }
});
$joinRoomCloseBtn.addEventListener("keydown", (e) => {
  keyBoardFocutOPT(e, $joinRoomBtn, $inputRoomId);
});

// 비밀번호 모달창
const $passwordModal = $sectionContents.querySelector(".password-modal");
const $passwordModalDim = $passwordModal.querySelector(".dim");
const $passwordModalConfirmBtn = $passwordModal.querySelector(".btn-confirm");
const $passwordModalCancleBtn = $passwordModal.querySelector(".btn-cancel");
const $passwordModalInput = $passwordModal.querySelector(".input-password");

$passwordModalInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.trim();
});
$passwordModalInput.addEventListener("keydown", (e) => keyBoardFocutOPT(e, $passwordModalCancleBtn));
$passwordModalCancleBtn.addEventListener("keydown", (e) => keyBoardFocutOPT(e, $passwordModalConfirmBtn, $passwordModalInput));

export function modalPrompt(roomData) {
  $passwordModal.classList.add("active");
  $passwordModalInput.focus();

  async function handleConfirm(e) {
    e.preventDefault();
    const value = $passwordModalInput.value;
    if (!value) {
      alert("비밀번호를 입력해주세요!");
      return;
    }
    if (value !== roomData.password) {
      alert("비밀번호가 일치하지 않습니다!");
      $passwordModalInput.value = "";
      return;
    }
    location.href = `chatting.html?id=${roomData.id}`;
    handleCancel();
  }
  function handleCancel() {
    $passwordModal.classList.remove("active");
    $passwordModalInput.value = "";
    $passwordModalConfirmBtn.removeEventListener("click", handleConfirm);
    $passwordModalCancleBtn.removeEventListener("click", handleCancel);
    $passwordModalDim.removeEventListener("click", handleCancel);
  }
  $passwordModalConfirmBtn.addEventListener("click", handleConfirm);
  $passwordModalCancleBtn.addEventListener("click", handleCancel);
  $passwordModalDim.addEventListener("click", handleCancel);
}
