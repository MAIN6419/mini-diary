'use strict';
import { getCreatedAt } from "../commons/libray.js";
import { FetchDiary, deleteDiary, deleteEditDiaryImg, editDiary, uploadFile } from "../commons/firebase.js";
const $sectionContents = document.querySelector(".section-contents");
const $diaryWrapper = $sectionContents.querySelector(".diary-wrapper");
const $diaryTitle = $diaryWrapper .querySelector(".diary-title");
const $diaryCreatedAt = $diaryWrapper .querySelector(".diary-createdAt");
const $diaryContents = $diaryWrapper .querySelector(".diary-contents");
const $editBtn = $diaryWrapper .querySelector(".btn-edit");
const $deleteBtn = $diaryWrapper .querySelector(".btn-del");

const $editForm = $sectionContents.querySelector(".edit-form");
const $candelBtn = $editForm.querySelector(".btn-cancel");
const $editCompletedBtn = $editForm.querySelector(".btn-editCompleted");
const $inputTitle = $editForm.querySelector("#input-title");
const $inputContents = $editForm.querySelector("#input-contents");
const $loadingModal = $sectionContents.querySelector(".loading-modal");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const $inputUpload = document.querySelector("#input-upload");
const $btnUpload = document.querySelectorAll(".btn-upload");
const $previewImg = document.querySelectorAll(".preview-img");
const $resetBtn = document.querySelectorAll(".btn-reset");
const uploadImg = [];
let imgIdx = "0";

// preload된 데이터 가져오기
const diaryData = JSON.parse(sessionStorage.getItem("diaryData"));

const fetchData = async ()=> {
  // 만약 preload된 데이터가 있고, 데이터의 id가 urlParamsId값과 일치한다면 현재 preload된 데이터를 사용
  if(diaryData&&diaryData.id===id){
    return JSON.parse(sessionStorage.getItem("diaryData"));
  }
  // preload된 데이터가 없거나, preload된 데이터가 현재 다이어리 데이터와 일치하지 않는다면 서버에서 새로 데이터를 받음
  $loadingModal.classList.add("active");
   return await FetchDiary(id).then((res)=>{
    $loadingModal.classList.remove("active");
    return res;
  })
}

renderdiary();
 async function renderdiary() {
  const data =  await fetchData() || [];
  uploadImg.splice(0);
    if (!data) {
    $diaryTitle.textContent = '존재하지 않는 게시물';
    return;
  }
  
  $diaryTitle.textContent = data.title;
  $diaryCreatedAt.textContent = getCreatedAt(data.createdAt);
  $diaryCreatedAt.setAttribute(
    "datetime",
    new Date(data.createdAt).toISOString()
  );
    uploadImg.push(...data.imgURL);

  data.imgURL.forEach(el => {
    const $postImg = document.createElement("img");
    $postImg.setAttribute('class', "diary-img");
    $postImg.setAttribute('src', el);
    $postImg.setAttribute('alt', "포스트 이미지");
    $diaryContents.insertAdjacentElement("beforebegin", $postImg);
});
  $diaryContents.textContent = data.contents;
}

$editBtn.addEventListener("click", async () => {
  const data = await fetchData() || []
  console.log(data.imgURL)
  $editForm.classList.toggle("active");
  $diaryWrapper.classList.toggle("inactive");
  $inputTitle.value = data.title;
  $inputContents.value = data.contents;
  $previewImg.forEach((el,idx)=>{
    if(data.imgURL[idx]){
      el.setAttribute("src", data.imgURL[idx])
    }
  });
});
$deleteBtn.addEventListener("click", async() => {
  if (confirm("정말 삭제하시겠습니까?")) {
    await deleteDiary(id);
    location.href = "diaryList.html";
    alert("삭제가 완료되었습니다.")
  }
});
$candelBtn.addEventListener("click", () => {
  $editForm.classList.toggle("active");
  $diaryWrapper.classList.toggle("inactive");
});

$editCompletedBtn.addEventListener("click", async () => {
  const data =  await fetchData() || [];
  if(!$inputTitle.value.trim()){
    alert('제목을 입력해주세요!');
    return;
  }
  if(!$inputContents.value.trim()){
    alert('내용을 입력해주세요!');
    return;
  } 
  if(data.title===$inputTitle.value&&data.contents===$inputContents.value&&data.imgURL[0]===uploadImg[0]&&data.imgURL[1]===uploadImg[1]&&data.imgURL[2]===uploadImg[2]){
    alert("수정한 내용이 없습니다!");
    return;
  }
  if (confirm("정말 수정하겠습니까?")) {
    $loadingModal.classList.add("active");
    const fileInfo = { url: [], fileName: [] };
    for(const i in uploadImg) {
      // 이미지 배열에 들어있는 데이터가 file인것을 구분해줌
      if(uploadImg[i] !==data.imgURL[i]){
        const uploadResult = await uploadFile([uploadImg[i]]); // 파일 업로드 함수 호출 (Firebase Storage에 업로드)
        // 수정할때 이미지가 아직 채워지지 않은 이미지 배열이 존재하므로 존재하지 않는 이미지를 제거시 에러가 발생
        // 예외처리를 위해 사용
        deleteEditDiaryImg(data.imgFileName[i]);
        fileInfo.url.push(...uploadResult.url); // 업로드된 이미지의 URL을 배열에 저장
        fileInfo.fileName.push(...uploadResult.fileName);// 업로드된 이미지의 fileName을 배열에 저장
      } else {
        // File 객체가 아닌 경우, 기존 data의 이미지 URL와 fileName을 그대로 사용
        fileInfo.url.push(data.imgURL[i]);
        fileInfo.fileName.push(data.imgFileName[i]);
      }
    }
    $diaryTitle.textContent = $inputTitle.value;
    $diaryContents.textContent = $inputContents.value;
    const newData = {
      title: $inputTitle.value,
      contents: $inputContents.value,
      imgURL: fileInfo.url || [],
      imgFileName: fileInfo.fileName || []
    }
    await editDiary(id, newData);
    $loadingModal.classList.remove("active");
    // session storage 데이터 수정 preload를 위해
    const newDiary = JSON.parse(sessionStorage.getItem("diaryData"));
    newDiary.title = $inputTitle.value;
    newDiary.contents = $inputContents.value;
    newDiary.imgURL = fileInfo.url;
    newDiary.imgFileName = fileInfo.fileName;
    sessionStorage.setItem("diaryData", JSON.stringify(newDiary));
    // 이후 바뀐 데이터를 새로 받아오기 위해 새로고침
    location.reload();
  }
});

$btnUpload.forEach((el,idx) => {
  el.addEventListener("click",()=>{
    $inputUpload.click();
    imgIdx = idx;
  })
});

$resetBtn.forEach((el,idx)=>{
  el.addEventListener("click",()=>resetImg(idx));
})

function previewImg(e) {
  const file = e.currentTarget.files[0];
  const vaild = validataionImg(file);
  if (!vaild) return;
  const imageSrc = URL.createObjectURL(file);
  $previewImg[imgIdx].setAttribute("src", imageSrc);
  $previewImg[imgIdx].style.width= "100%";
  $previewImg[imgIdx].style.height= "100%";
  uploadImg[imgIdx] = file;
}
function resetImg(idx) {
  $previewImg[idx].setAttribute("src", "../img/imgUpload.png");
  $previewImg[idx].style.width= "70px";
  $previewImg[idx].style.height= "70px";
  uploadImg[idx] = "";
}
$inputUpload.addEventListener("change", (e)=>previewImg(e))
function validataionImg(file) {
  if (!file) {
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("파일의 크기를 초과하였습니다.(최대 5MB)");
    return;
  }
  return true;
}
