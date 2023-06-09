"use strict";
import _ from 'lodash';
import { getCreatedAt } from "../commons/libray.js";
import { fetchBestDiarys, fetchRecentDiary } from '../firebase/diary/firebase_diary.js';
import { FetchUserData, getAuthImg, getSessionUser } from '../firebase/auth/firebase_auth.js';
import { setFortune } from '../firebase/fortune/firebase_fortune.js';


import "../../css/home.css";

const $sectionContents = document.querySelector(".section-contents");
const $recentDiaryLists = $sectionContents.querySelector(".recent-diaryLists");
const $fortuneContents = $sectionContents.querySelector(".fortune-cotents");
const $diaryLists = $sectionContents.querySelector(".diary-lists");
const userData =  getSessionUser();
const $loadingModal = $sectionContents.querySelector(".loading-modal");
$loadingModal.classList.add("active");
const fortune = await fetchFortuneData();
await rederRecentDiary();
await renderFortune();
await renderBestDiary();
$loadingModal.classList.remove("active");

async function rederRecentDiary() {
  const data = await fetchRecentDiary();
  $recentDiaryLists.innerHTML = "";
  if (data.length === 0) {
    $recentDiaryLists.innerHTML += `
      <li class="no-diary">현재 다이어리가 없어요~</li>
      `;
    return;
  }

  const frag = document.createDocumentFragment();
  for (const item of data) {
    const $diaryItem = document.createElement("li");
    const $recentLink = document.createElement("a");
    const $createdAt = document.createElement("time");

    $diaryItem.setAttribute("class", "recent-item");

    $recentLink.textContent = item.title;
    $recentLink.setAttribute("href", `diary.html?id=${item.id}`);

    $createdAt.setAttribute("class", "createdAt");
    $createdAt.setAttribute("datetime", new Date(item.createdAt).toISOString());
    $createdAt.textContent = getCreatedAt(item.createdAt);

    frag.appendChild($diaryItem);
    $diaryItem.appendChild($recentLink);
    $diaryItem.appendChild($createdAt);
  }
  $recentDiaryLists.appendChild(frag);
}

function renderFortune() {
  if (fortune) {
    $fortuneContents.textContent = fortune.result;
  } else {
    $fortuneContents.textContent = "아직 운세를 보지 않았네요.";
  }
}

async function fetchFortuneData() {
  // 운세 데이터 불러오기
   let fortune =  (await FetchUserData(userData.displayName)).fortune; 
  // 하루가 지나면 운세보기 초기화
  if (fortune) {
    const fortuneCreatedAt = new Date(fortune.createdAt);
    const currentDate = new Date();
    // 운세 데이터가 만들어진 날짜와 현재 날짜를 비교
    // 날짜 차이가 난다면 하루가 지난것 이므로 운세 데이터를 삭제
    if (currentDate.getDate() !== fortuneCreatedAt.getDate()) {
      setFortune(userData.displayName, "");
      // 운세 데이터 초기화
      fortune = "";
    }
  }
  return fortune;
}

async function renderBestDiary() {
  const frag = new DocumentFragment();
  const data = await fetchBestDiarys();
  if (data.length === 0) {
    $diaryLists.innerHTML += `
      <li class="no-diary">
      현재 다이어리가 없어요~
      </li>
      `;
    return;
  }
  for(const diary of data) {
    const listItem = document.createElement('li');
    listItem.classList.add('diary');

    const anchor = document.createElement('a');
    anchor.href = `diary.html?id=${diary.id}`;
    listItem.appendChild(anchor);

    const img = document.createElement('img');
    img.classList.add('diary-img');
    img.src = diary.imgURL[0] || './img/no-image.png';
    img.alt = '다이어리 이미지';
    anchor.appendChild(img);

    const contentsDiv = document.createElement('div');
    contentsDiv.classList.add('diary-contents');

    const title = document.createElement('h3');
    title.classList.add('diary-title');
    title.textContent = diary.title;
    contentsDiv.appendChild(title);

    const text = document.createElement('p');
    text.classList.add('diary-text');
    text.textContent = diary.contents;
    contentsDiv.appendChild(text);

    const bottomDiv = document.createElement('div');
    bottomDiv.classList.add('diary-bottom');

    const profileImg = document.createElement('img');
    profileImg.classList.add('diary-profileImg');
    profileImg.src = './img/placeholderImg.png';
    profileImg.alt = '';
    bottomDiv.appendChild(profileImg);

    const auth = document.createElement('span');
    auth.classList.add('diary-auth');
    auth.textContent = diary.auth;
    bottomDiv.appendChild(auth);

    const createdAt = document.createElement('time');
    createdAt.classList.add('diary-createdAt');
    createdAt.datetime = new Date(diary.createdAt).toISOString();
    createdAt.textContent = getCreatedAt(diary.createdAt);
    bottomDiv.appendChild(createdAt);

    contentsDiv.appendChild(bottomDiv);
    anchor.appendChild(contentsDiv);

    const empathy = document.createElement("span");
    empathy.setAttribute("class", "diary-empathy");
    empathy.textContent = `${diary.empathy}`
    contentsDiv.appendChild(empathy);

    $diaryLists.appendChild(listItem);
    fetchAuthImg(profileImg, diary)
  }
  $diaryLists.appendChild(frag);
}

// 다이어리 작성자 이미지를 불러오는 함수 => placeholderImg 교체
async function fetchAuthImg(profileImg, data) {
  profileImg.src = await getAuthImg(data.auth) || "./img/profile.png";;
}


