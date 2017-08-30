function $(s){
    return document.querySelectorAll(s);
}

var lis = $("#list li");
for(var i = 0; i < lis.length; i++){
    lis[i].onclick = function(){
         for(var j = 0; j < lis.length; j++){
             lis[j].className = "";
         }
         this.className = "selected";
        //  load("/media/"+this.title);
        mv.play("/media/"+this.title);
    }
}

//创建对象
var mv = new MusicVisualizer({
    size: size,
    visualizer: draw
});

// var xhr = new XMLHttpRequest();
// var ac = new (window.AudioContext||window.webkitAudioContext)();//音频对象(AudioContext)
// var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();//控制音量的对象(GainNode)
// gainNode.connect(ac.destination);   //把GainNode连接到AudioDestinationNode最终节点上

// var analyser = ac.createAnalyser();      //创建一个分析音频数据资源的对象
var size = 64;
// analyser.fftSize = size * 2;//数据长度就是512的一半
// analyser.connect(gainNode);

// //一。修复点击歌曲不停止播放上一首歌曲的bug
// var source = null;  //1.声明一个变量为空
// //听完歌以后就可以判断source是否存在，如果存在就说明有歌正在播放

// //二。修复当点击歌曲以后还没有播放时，再点击下一首歌曲会出现歌曲同时播放的情况。
// var count = 0;//1.计数器


//*******************给id为box的标签中动态的添加canvas***********************
var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
function random(m,n){
    return Math.round(Math.random()*(n - m) + m);
}
function getDots(){
    Dots = [];
    for(var i = 0; i < size; i++){
        var x = random(0,width);
        var y = random(0,height);
        var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)"
        Dots.push({
            x: x,
            y: y,
            dx: random(0.5, 2),
            color:color,
            cap: 0   //柱状图上面的小方块
        });
    }
}
var line;
function resize(){
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0, 0, 0, height);  //渐变和渐变色
    line.addColorStop(0, "red");
    line.addColorStop(0.5, "yellow");
    line.addColorStop(1, "green");
    getDots();
}
resize();
window.onresize = resize;

draw.type = "dot";
var types = $("#type li");
for(var i = 0; i < types.length; i++){
    types[i].onclick = function(){
         for(var j = 0; j < types.length; j++){
             types[j].className = "";
         }
         this.className = "selected";
         draw.type = this.getAttribute("data-type");
    }
}

//arr音频资源数据已经获取到了。现在定义一个函数使用arr，绘制图形。
function draw(arr){
    ctx.clearRect(0,0,width, height);
    var w = width / size; //柱状图的宽
    var cw = w * 0.6;
    var capH = cw > 10 ? 10 :　cw;
    ctx.fillStyle = line;
    for(var i = 0; i< size; i++){
        var o = Dots[i];
        if(draw.type == "column"){
            var h = arr[i] / 256 * height;
            ctx.fillRect(w * i, height - h, cw, h);
            ctx.fillRect(w * i, height - (o.cap+capH), cw, capH);
            o.cap--;
            if(o.cap < 0){
                o.cap = 0;
            }
            if(h > 0 && o.cap < h + 40){
                o.cap = h + 40 > height - capH ? height - capH : h + 40;
            }
        }else if(draw.type == "dot"){
            ctx.beginPath();
            var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10;
            ctx.arc(o.x, o.y, r, 0, Math.PI*2,true);//绘制圆
            var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
            g.addColorStop(0,"#fff");
            g.addColorStop(1,o.color);
            ctx.fillStyle = g;
            ctx.fill();
            o.x += o.dx;
            o.x = o.x > width ? 0 : o.x;
            // ctx.strokeStyle = "#fff";
            // ctx.stroke();
        }
        
    }
}


// function load(url){
//     var n = ++count;//2.此时如果点击第二次，因为n在load函数中所以n不会变化，但是全局的count会发生变化 
//     source && source[source.stop ? "stop":"noteOff"]();
//     //3.进行判断如果source存在就会停止歌曲。
//     xhr.abort();//终止上一次请求.ajax修复方法(修复当点击歌曲以后还没有播放时，再点击下一首歌曲会出现歌曲同时播放的情况。)
//     xhr.open("GET",url);
//     xhr.responseType = "arraybuffer";
//     xhr.send();
//     xhr.onload = function(){
//         if(n != count)return;//3。判断如果n不等于全局的count就会返回
//         ac.decodeAudioData(xhr.response, function(buffer){ //异步解码成功后
//             if(n != count)return;
//             var bufferSource = ac.createBufferSource();  //创建出来的是AudioBufferSourceNode
//             bufferSource.buffer = buffer;//音频资源
//             bufferSource.loop = true;//设置循环播放
//             bufferSource.connect(analyser);           //把AudioBufferSourceNode连接到Analyser节点上
//             // bufferSource.connect(gainNode);        //把AudioBufferSourceNode连接到GainNode节点上
//             // bufferSource.connect(ac.destination);  //把AudioBufferSourceNode连接到AudioDestinationNode最终节点上
//             bufferSource[bufferSource.start?"start":"noteOn"](0);//开始播放音频
//             source = bufferSource; //2.一首歌解码成功，并播放之后，可以把这个bufferSource保存下来
//         },function(err){
//             console.log(err);
//         });
//         // console.log(xhr.response);
//     }
// }

// //作用是获得Analyser分析得到的音频资源数据
// function visualizer(){
//     var arr = new Uint8Array(analyser.frequencyBinCount);
    
//     // console.log(arr);
//     //想要实时更新，也就是一直拿到音频资源数据，使用动画函数
//     requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
//     function v(){
//         analyser.getByteFrequencyData(arr);
//         // console.log(arr);
//         draw(arr);
//         requestAnimationFrame(v);
//     }
//     requestAnimationFrame(v);
// }
//  visualizer();


// //作用是改变GainNode的value值的大小，也就是调节音量
// function changeVolume(percent){
//     gainNode.gain.value = percent * percent;
// }




$("#volume")[0].onchange = function(){
    mv.changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();