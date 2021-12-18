const songsAPI = "https://list-song-all.glitch.me/top100_VN";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const navMenu = $(".navbar");
const toggleMenu = $(".header-toggle");
const closeMenu = $(".navbar-close");
const navItems = $$(".navbar-item");
const navActive = $(".navbar-item.active");
const line = $(".line");

line.style.top = navActive.offsetTop + "px";
line.style.height = navActive.offsetHeight + "px";

navItems.forEach((item, index) => {
  item.onclick = function () {
    $(".navbar-item.active").classList.remove("active");
    this.classList.add("active");
    line.style.top = this.offsetTop + "px";
    line.style.height = this.offsetHeight + "px";
  };
});

toggleMenu.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

closeMenu.addEventListener("click", () => {
  navMenu.classList.remove("show");
});

const playList = $(".playlist-data");
const recentlyList = $(".recently-data");
const creatorList = $(".other-data");
const rateCount = $(".rate-quantity");
const waveForm = $("#waveform");
const playBtn = $(".btn-toggle--play");
const repeatBtn = $(".btn-repeat");
const randomBtn = $(".btn-random");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const playElement = $(".icon-play");
const pauseElement = $(".icon-pause");
const progresss = $("#progress");
const currentTime = $(".current");
const durationTime = $(".duration");
const imgSong = $(".dasboard-song--info .img-bg");
const titleSong = $(".dasboard-title");
const descSong = $(".dasboard-desc");
const dasBoard = $(".dasboard");
const searchInput = $(".search-input");
let currentIndex = 0;
let isRandom = false;
let isRepeat = false;
let isSearch = false;
// const app = {
//   render: getSongs(renderSongs),
//   start: function () {
//     this.render();
//   },
// };
// app.start();

// chạy chương trình
function start() {
  getSongs(renderPlayList);
  getAllSongs();
  searchSong();
  handleEvents();
}
start();

// create wave progress music bar -- use wavesurfer library
var wavesurfer = WaveSurfer.create({
  container: waveForm,
  waveColor: "violet",
  progressColor: "#7957e8",
  barWidth: 4,
  cursorWidth: 0,
  height: 90,
  barGap: 5,
  scrollParent: true,
  responsive: true,
  hideScrollbar: true,
  barRadius: 4,
  barMinHeight: 2,
});

// lấy chi tiết nhạc từ api
function getSongs(callback) {
  fetch(songsAPI)
    .then((res) => res.json())
    .then(callback);
}

// chỉ lấy nhạc từ api
function getAllSongs() {
  fetch("https://all-songs.glitch.me/songs")
    .then((res) => res.json())
    .then((data) => {
      renderRecently(data);
      renderArtists(data);
    });
}

// render playlist
function renderPlayList(items) {
  const playListHtmls = items.map((item) => {
    return `
        <div class="playlist-item">
            <img src="${item.bg}">
            <div class="playlist-content">
                <h3 class="playlist-name">
                    ${item.name}
                </h3>
                <div class="playlist-quantity">
                    ${item.songs.length} songs
                </div>
            </div>
        </div>
            `;
  });

  // đẩy lên DOM
  playList.innerHTML = playListHtmls.join("");
}

// render recently
function renderRecently(items) {
  // tạo array nhạc random
  let randListSongs = shuffle(items);

  // render section recently
  const recentlyListHtmls = randListSongs.slice(0, 20).map((song, index) => {
    return `
    <div class="recently-item">
        <div class="recently-content" data-index="${index}" data-id="${song.id}">
            <img src="${song.bgImage}" alt="loading" class="img-bg">
            <div class="recently-article">
                <div class="recently-name">
                    ${song.title}
                </div>
                <div class="recently-desc">
                    ${song.creator}
                </div>
            </div>
        </div>
        <div class="recently-config">            
            <div class="recently-rate">
                <div class="rate-icon">
                    <span class="rate-quantity">3</span>
                    <i class="fas fa-star"></i>
                </div>
            </div>
            <div class="recently-settings">
              <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
    </div>
    `;
  });

  recentlyList.innerHTML = recentlyListHtmls.join("");

  // when click recently event
  recentlyList.onclick = function (e) {
    const songNode = e.target.closest(".recently-content");
    if (songNode) {
      if (isSearch) {
        showSearchValues(Number(songNode.dataset.id));
      } else {
        currentIndex = Number(songNode.dataset.index);
        loadCurrentSong(randListSongs, currentIndex);
      }
      dasBoard.style.display = "block";
      pauseElement.style.display = "block";
      playElement.style.display = "none";
    }
  };

  // when next song
  nextBtn.onclick = function () {
    if (isRandom) {
      let newIndex;
      do {
        newIndex = Math.floor(
          Math.random() * randListSongs.slice(0, 20).length
        );
      } while (newIndex === currentIndex);
      currentIndex = newIndex;
    } else {
      currentIndex >= randListSongs.slice(0, 20).length - 1
        ? (currentIndex = 0)
        : currentIndex++;
    }
    pauseElement.style.display = "block";
    playElement.style.display = "none";
    loadCurrentSong(randListSongs, currentIndex);
  };

  // when prev song
  prevBtn.onclick = function () {
    if (isRandom) {
      let newIndex;
      do {
        newIndex = Math.floor(
          Math.random() * randListSongs.slice(0, 20).length
        );
      } while (newIndex === currentIndex);
      currentIndex = newIndex;
    } else {
      currentIndex < 0
        ? (currentIndex = randListSongs.slice(0, 20).length - 1)
        : currentIndex--;
    }
    pauseElement.style.display = "block";
    playElement.style.display = "none";
    loadCurrentSong(randListSongs, currentIndex);
  };

  // next the song
  wavesurfer.on("finish", function (e) {
    if (isRepeat) {
      wavesurfer.play();
    } else if (isSearch) {
      wavesurfer.play();
    } else {
      nextBtn.click();
    }
    pauseElement.style.display = "block";
    playElement.style.display = "none";
  });

  // lặp lại bài hát đang phát
  repeatBtn.onclick = function () {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
  };
  // random bài hát
  randomBtn.onclick = function () {
    isRandom = !isRandom;
    randomBtn.classList.toggle("active", isRandom);
  };
}

// render artists
function renderArtists(items) {
  // lấy list author và image
  let authorList = items.reduce((result, song) => {
    let arrCreator = [
      {
        name: song.creator,
        bgImage: song.bgImage,
      },
    ];
    return result.concat(arrCreator);
  }, []);

  // tạo list tác giả và image mới
  let authorData = convert(authorList);

  // tạo array author random
  let randListAuthor = shuffle(authorData);

  // render section artists
  const artistsListHtmls = randListAuthor.slice(0, 5).map((author) => {
    return `
    <div class="other-item">
        <div class="other-content">
            <div class="other-bg">
                <img src="${author.bgImage}" alt="loading" class="img-bg">
                <div class="other-rate">
                    <span class="rate-quantity">3</span>
                    <i class="fas fa-star"></i>
                </div>
            </div>
            <div class="other-author">
                <div class="other-name">
                    ${author.name}
                </div>
                <div class="other-desc">
                    ${author.count}songs in library
                </div>
            </div>
        </div>
        <div class=other-config">
            <i class="fas fa-ellipsis-h"></i>
        </div>
    </div>
    `;
  });

  creatorList.innerHTML = artistsListHtmls.join("");

  // rates song
  $$(".fas.fa-star").forEach((item, index) => {
    item.onclick = function () {
      rateStar($$(".rate-quantity")[index]);
    };
  });
}

// push data lên dasboard music
function loadCurrentSong(currentSong, index) {
  if (isSearch) {
    imgSong.src = `${currentSong.bgImage}`;
    titleSong.textContent = currentSong.title;
    descSong.textContent = currentSong.creator;
    wavesurfer.load(`${currentSong.music}`);
  } else {
    imgSong.src = `${currentSong[index].bgImage}`;
    titleSong.textContent = currentSong[index].title;
    descSong.textContent = currentSong[index].creator;
    wavesurfer.load(`${currentSong[index].music}`);
  }
  wavesurfer.on("ready", function (e) {
    durationTime.textContent = timeCaculator(wavesurfer.getDuration());
    wavesurfer.play();
  });
  wavesurfer.on("audioprocess", function (e) {
    currentTime.textContent = timeCaculator(wavesurfer.getCurrentTime());
  });
  wavesurfer.on("seek", function (e) {
    currentTime.textContent = timeCaculator(wavesurfer.getCurrentTime());
  });
}

// handle events
function handleEvents() {
  // when click play event
  playBtn.onclick = function () {
    if (!wavesurfer.isPlaying()) {
      wavesurfer.play();
      pauseElement.style.display = "block";
      playElement.style.display = "none";
    } else {
      wavesurfer.pause();
      pauseElement.style.display = "none";
      playElement.style.display = "block";
    }
  };
}

// tìm kiếm song
function searchSong() {
  searchInput.onkeyup = function (e) {
    if (e.keyCode === 13) {
      isSearch = true;
      e.preventDefault();
      let searchQuery = searchInput.value;
      getOnlySongs(searchQuery);
    }
  };
}

// hàm tính thời gian bài hát
function timeCaculator(value) {
  let second = Math.floor(value % 60);
  let minute = Math.floor((value / 60) % 60);
  if (second < 10) {
    second = "0" + second;
  }
  return minute + ":" + second;
}

// hàn random arr
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

// rate star song
function rateStar(rateCount) {
  let count = rateCount.innerText;
  if (rateCount.innerText < 5) {
    count++;
  } else {
    count = 1;
  }
  rateCount.style.color = "yellow";
  rateCount.innerText = count;
}

// hàn list gộp các bài hát có chung tác giả
const convert = (arr) => {
  const res = {};
  arr.forEach((obj) => {
    const key = `${obj.name}${obj.bgImage}`;
    if (!res[key]) {
      res[key] = {
        ...obj,
        count: 0,
      };
    }
    res[key].count += 1;
  });
  return Object.values(res);
};

// render nhạc từ input search
function getOnlySongs(searchQuery) {
  fetch(`https://all-songs.glitch.me/songs?q=${searchQuery}`)
    .then((res) => res.json())
    .then((data) => {
      const searchInputHtmls = data.map((song, index) => {
        return `
              <div class="recently-item">
                  <div class="recently-content" data-index="${index}" data-id="${song.id}">
                      <img src="${song.bgImage}" alt="loading" class="img-bg">
                      <div class="recently-article">
                          <div class="recently-name">
                              ${song.title}
                          </div>
                          <div class="recently-desc">
                              ${song.creator}
                          </div>
                      </div>
                  </div>
                  <div class="recently-config">            
                      <div class="recently-rate">
                          <div class="rate-icon">
                              <span class="rate-quantity">3</span>
                              <i class="fas fa-star"></i>
                          </div>
                      </div>
                      <div class="recently-settings">
                        <i class="fas fa-ellipsis-h"></i>
                      </div>
                  </div>
              </div>
              `;
      });
      recentlyList.innerHTML = searchInputHtmls.join("");
    });
}

// hiển thị kết quả search
function showSearchValues(id) {
  fetch(`https://all-songs.glitch.me/songs/${id}`)
    .then((res) => res.json())
    .then((data) => {
      loadCurrentSong(data);
    });
}
