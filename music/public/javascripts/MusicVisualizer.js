function MusicVisualizer(obj){
    this.source = null;

    this.count = 0;

    this.analyser = MusicVisualizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftsize = this.size * 2;

    this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain" : "createGainNode"]();
    this.gainNode.connect(MusicVisualizer.ac.destination);

    this.analyser.connect(this.gainNode);

    this.xhr = new XMLHttpRequest();
    
    this.visualizer = obj.visualizer;
    this.visualize();
}

MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext)();

//播放音乐
MusicVisualizer.prototype.play = function(url){
    var n = ++this.count;
    var self = this;
    this.source && this.stop();  
    this.load(url,function(arraybuffer){  //这个是load()
        if(n != self.count)return;
        self.decode(arraybuffer,function(buffer){  //这个是decode()
            if(n != self.count)return;
            var bs = MusicVisualizer.ac.createBufferSource();
            bs.buffer = buffer;
            // bs.loop = true;
            bs.connect(self.analyser);
            bs[bs.start ? "start" : "noteOn"](0);
            self.source = bs;
        })
    })
}

//ajax请求音频数据
MusicVisualizer.prototype.load = function(url,fun){ //运用了回调函数，当调用load时会把self.xhr.response当做实参传入到load函数对应的形参中
    this.xhr.abort();
    this.xhr.open("GET",url);
    this.xhr.responseType = "arraybuffer";
    this.xhr.send();
    var self = this;
    this.xhr.onload = function(){
        fun(self.xhr.response);
    } 
}

//音频解码，使音频可以播放
MusicVisualizer.prototype.decode = function(arraybuffer, fun){//回调函数，同上
    MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
        fun(buffer)
    },function(err){
        console.log(err);
    });
}
//停止播放
MusicVisualizer.prototype.stop = function(){
    this.source[this.source.stop ? "stop" : "noteOn"](0);
}
//音量控制
MusicVisualizer.prototype.changeVolume = function(percent){
    this.gainNode.gain.value = percent * percent;
}

//音乐可视化效果
MusicVisualizer.prototype.visualize = function(){
    var arr = new Uint8Array(this.analyser.frequencyBinCount);  
    // console.log(arr);
    //想要实时更新，也就是一直拿到音频资源数据，使用动画函数
    requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    var self = this;
    function v(){
        self.analyser.getByteFrequencyData(arr);
        console.log(arr);
        self.visualizer(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}








