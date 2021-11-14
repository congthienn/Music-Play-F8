const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);  
const songName = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn =$(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");
const PLAYER_STORAGE_KEY = 'F8';
const app = {
    currentIndex: 0,//index mặc định của mảng bài hát khi vừa load trang
    isRandom:false,
    thisPlay: false, //Thể hiện trạng thái play / pause,
    isRepeat:false,
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    //Set config
    setConfig:function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'Always Remember Us This Way',
            singer: 'Lady Gaga',
            path: 'assets/music/AlwaysRememberUsThisWay-LadyGaga-5693911.mp3',
            image: 'assets/img/1.jpg'
        },
        {
            name: 'Shallow',
            singer: 'Lady Gaga',
            path: 'assets/music/Shallow-Lady-Gaga_ Bradley-Cooper.mp3',
            image: 'assets/img/2.jpg'
        },
        {
            name: 'I Never Love Again',
            singer: 'Lady Gaga',
            path: 'assets/music/ILlNeverLoveExtendedVersionRadioEdit-LadyGaga-5693922.mp3',
            image: 'assets/img/3.jpg'
        },
        {
            name: 'Heal Me',
            singer: 'Lady Gaga',
            path: 'assets/music/healme.mp3',
            image: 'assets/img/4.jpg'
        },
        {
            name: 'Before I Cry',
            singer: 'Lady Gaga',
            path: 'assets/music/BeforeICry-LadyGaga-5693918.mp3',
            image: 'assets/img/5.png'
        },
        {
            name: 'Too Far Gone',
            singer: 'Bradley Cooper',
            path: 'assets/music/toofar.mp3',
            image: 'assets/img/6.jpg'
        }
    ],
    //Render danh sách bài hát
    render:function(){
        const html = this.songs.map((song,index) => {
        return `
                <div class="song ${index === this.currentIndex ? 'active': ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`;
        });
       $(".playlist").innerHTML = html.join('\n');
    },
    //Định nghĩa các thuộc tính cho Object 
    defineProperties: function () {
        //Định nghĩa cho bài hát mặc định khi vào trang web 
        Object.defineProperty(this,'currentSong',{
            get: function () {
               return this.songs[this.currentIndex];
            } 
        });
        //this->currentSong thể hiện đến bài hát đang được mở trên trình duyệt
        
    },
    //Tải thông tin bài hát
    loadCurrentSong:function () {
        songName.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },
    //Next bài hát
    nextSong:function() {
        this.currentIndex ++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();
    },
    //Lùi bài hát
    prevSong:function() {
        this.currentIndex --;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();
    },
    //Kéo bài hát
    scrollToActiveSong:function() {
        setTimeout(()=>{
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: `${this.currentIndex < 3 ? 'end' : 'center'}`
            });
        },300)
       
    },
    //Hàm xử lý các sự kiện
    handleEnvents:function (event){
        //Xử lý sự kiện scroll cho hình nhỏ lại
        const _this = this;
        const cdWidth = cd.offsetWidth;
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;//Tăng giảm width của hình ảnh
            cd.style.opacity = newWidth / cdWidth; //Opacity
        }
         //Xử lý quay CD  
         const cdThumbAnimation = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 10000,//Thời gian lặp lại
            iterations: Infinity
        });
        cdThumbAnimation.pause();
        //Bắt sự kiện nhấn nút play
        playBtn.onclick = function() {
            if(!_this.thisPlay){
                audio.play();
            }else{
                audio.pause();
            }  
        }
        //Sự kiện play audio
        audio.onplay = function() {
            _this.thisPlay = true;
            $(".player").classList.add("playing");
            cdThumbAnimation.play();
        }
        //Sự kiện pause audio
        audio.onpause = function() {
            _this.thisPlay = false;
            $(".player").classList.remove("playing");
            cdThumbAnimation.pause();
        }
        //Sự kiện chạy của audio
        audio.ontimeupdate = function() {
            if(audio.duration){
                progress.value = ((Math.floor(audio.currentTime / audio.duration * 100)));
            }
            //audio.duration: trả về thời lượng của bài hát
            //audio.currentTime: trả về giây đang phát
        }
        //Sự kiện tua audio
        progress.onchange = function(e){
            e.stopPropagation();
            const timePorgress = (audio.duration / 100 * this.value);
            audio.currentTime = timePorgress;
        }
        //Next bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandom();
                _this.render();
                _this.scrollToActiveSong();
            }else{
                _this.nextSong();
            }
            audio.play();
        },
        //Prev bài hát
        prevBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandom();//Random bài hát
                _this.render();
                _this.scrollToActiveSong();
            }else{
                 _this.prevSong();
            } 
            audio.play();
        },
        //Random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle("active",_this.isRandom);
            _this.setConfig("isRandom",_this.isRandom);
        }
        //Xử lý next song khi hết bài hát
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click(); //Tự động click vào nút next
            }
        }
        //Xử lý lặp lại bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle("active",_this.isRepeat);
            _this.setConfig("isRepeat",_this.isRepeat);
        }
        //Lắng nghe sự kiện chọn bài hát
        playList.onclick = function(e) {
            const songNode = e.target.closest(".song:not(.active)");
            if( songNode || e.target.closest(".option")){
                //Xử lí khi click vào bài hát
                if(songNode){
                    const indexSong = Number(songNode.getAttribute("data-index"));
                    _this.currentIndex = indexSong;
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                if(e.target.closest(".option")){
                    console.log(e.target);
                }
            }
        }
    },
    //Lưu cấu hình
    loadConfig:function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        randomBtn.classList.toggle("active",this.isRandom);
        repeatBtn.classList.toggle("active",this.isRepeat);
    },
    playRandom:function() {
        var newtIndex;
        do{
            newtIndex = Math.floor(Math.random() * this.songs.length);
        }while(newtIndex == this.currentIndex);
        this.currentIndex = newtIndex;
        this.loadCurrentSong();
    },
    //Hàm thực thi các hàm trong Object
    start: function(){
        this.loadConfig();
        this.render();
        this.handleEnvents();
        this.defineProperties();
        this.loadCurrentSong();
    }
}
app.start();