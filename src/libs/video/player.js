import Worker from  "./video.worker?worker";

// TODO 需要内联css
class PlayerSource {
    // this.socket.readyState
    // 0 CONNECTING 正在连接 1 OPEN 连接 2 CLOSING 正在关闭 3 CLOSED 关闭
    url;
    socket;
    reconnect_timer;
    reconnect_second = 3; // 重连间隔
    reconnect_number = 3; // 重连次数
    message_heart = 0; //服务器发送数据的心跳
	message_heart2 = 0; //本客户端发送数据的心跳
	begin_time = 0; // 如果持续了30分钟就不消耗重连次数
    // INIT CONNECTING CONNECTED CLOSING CLOSED
    status = 'init';
    cb_open;
    cb_msg;
    cb_close;
    constructor(url) {
    	this.url = url;
    	// this.reconnect_second = reconnect_second;
    	// this.reconnect_number = reconnect_number;
    	// this.cb_open = cb_open;
    	// this.cb_msg = cb_msg;
    	// this.cb_close = cb_close;
    	this.connect();
    }
    connect() {
    	this.socket = new WebSocket(this.url);
    	this.socket.binaryType = 'arraybuffer';
    	this.socket.onopen = this.onopen.bind(this);
    	this.socket.onmessage = this.onmessage.bind(this);
    	this.socket.onclose = this.onclose.bind(this);
    	this.status = 'connecting';
    }
    destroy() {
    	if (this.reconnect_timer) {
    		clearTimeout(this.reconnect_timer);
    	}
    	this.reconnect_number = 0;
    	this.status = 'closed';
    	if (this.socket) {
    		this.socket.close();
    	}
    }
    onopen() {
    	this.status = 'connected';
    	this.cb_open({
    		'protocol': this.socket.protocol,
    		'status': this.socket.readyState,
    		'url': this.socket.url
    	});
		this.begin_time = Math.round(performance.now() / 1000);
    }
    onmessage(evt) {
    	var msg = new Uint8Array(evt.data);
    	this.cb_msg(msg);

		var now_sec = Math.round(performance.now() / 1000);
		if ((now_sec - this.message_heart2) > 3) {
            console.log("sleep", now_sec, this.message_heart2);
            setTimeout(function () {
                this.send("HGV001\x00\x06\x00\x00\x00\x18Hear\x00\x00\x00\x0CTrue");
            }.bind(this), 1);
        }
    	this.message_heart = now_sec;
    }
    onclose(evt) {
    	this.status = 'closed';
    	this.cb_close({
    		'code': evt.code,
    		'reason': evt.reason,
    		'recount': this.reconnect_number
    	});
    	if (this.reconnect_number > 0) {
    		clearTimeout(this.reconnect_timer);
    		var now_sec = Math.round(performance.now() / 1000);
            if ((now_sec - this.begin_time) < 1200) {
                this.reconnect_number = this.reconnect_number - 1;
            }
    		this.reconnect_timer = setTimeout(function () {
    			this.cb_close({
    				'code': 0,
    				'reconnet': this.reconnect_number
    			});
    			this.connect();
    		}.bind(this), this.reconnect_second * 1000);
    	}
		this.begin_time = 0;
    }
    send(msg) {
    	if (this.message_heart) {
    		var now_sec = Math.round(performance.now() / 1000);
    		if (now_sec - this.message_heart > 10) {
    			this.socket.close(1000);
    			this.message_heart = Math.round(performance.now() / 1000);
    		}
    	}

    	if (this.socket && this.socket.readyState == WebSocket.OPEN) {
    		this.socket.send(msg);
    		return true;
    	} else {
    		return false;
    	}
    }
}
class PlayerRender {
    // 顶点着色器
    // 属性常用于存储颜色、坐标等需在JS和顶点着色器间互相传递的值
    // 变量常用于顶点着色器和片段着色器间传递数据
    // 常量常用于灯光、全局变换等一帧的所有绘制中相同的数据
    // 会对属性所形成的矩阵进行轮询，获取每一个点
    static vertexShaderScript = [
    	'attribute vec2 pos;',
    	'attribute vec2 dataPos;',
    	'varying vec2 texturePos;',
    	'void main() {',
    	'gl_Position = vec4(pos, 0, 1);',
    	'texturePos = dataPos.xy;',
    	'}'
    ].join('\n');
    // 使用precision指定精度，highp是32位浮点，midump是16位浮点，暂不清楚精度是否足够因此不修改
    // 使用texture2D采样yuv数据，并使用矩阵计算rgb数据
    // texture2D用于纹理采样，有新函数texture，暂不清楚如何查询版本因此不配置
    static fragmentShaderScript = [
    	'precision highp float;',
    	'varying vec2 texturePos;',
    	'uniform sampler2D ySampler;',
    	'uniform sampler2D uSampler;',
    	'uniform sampler2D vSampler;',
    	'uniform mat4 YUV2RGB;',
    	'void main(void) {',
    	'lowp float y = texture2D(ySampler, texturePos).r;',
    	'lowp float u = texture2D(uSampler, texturePos).r;',
    	'lowp float v = texture2D(vSampler, texturePos).r;',
    	'gl_FragColor = vec4(y, u, v, 1) * YUV2RGB;',
    	'}'
    ].join('\n');
    // 转换矩阵
    static YUV2RGB = [
    	1.16438, 0.00000, 1.59603, -0.87079,
    	1.16438, -0.39176, -0.81297, 0.52959,
    	1.16438, 2.01723, 0.00000, -1.08139,
    	0, 0, 0, 1
    ];
    // 创建着色器 gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    // 参数：gl对象、着色器类型、源码
    // 返回：null或着色器对象
    static loadShader(gl, type, source) {
    	// 创建一个 WebGLShader 对象
    	const shader = gl.createShader(type);
    	// 设置源码
    	gl.shaderSource(shader, source);
    	// 编译，以使其可用于 WebGLProgram 对象
    	gl.compileShader(shader);
    	// 查询信息，这里是查询最后一个着色器编译是否成功
    	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    		console.error('compile shader', gl.getShaderInfoLog(shader));
    		gl.deleteShader(shader);
    		return null;
    	}
    	return shader;
    }
    // 创建一个 WebGLProgram 对象，由两个 WebGLShader 组成
    // 参数：顶点着色器源码、片段着色器源码
    // 返回：null或对象
    static initShaderProgram(gl, vsSource, fsSource) {
    	// 创建着色器
    	const vertexShader = PlayerRender.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    	const fragmentShader = PlayerRender.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    	// 创建，并附加着色器
    	const shaderProgram = gl.createProgram();
    	gl.attachShader(shaderProgram, vertexShader);
    	gl.attachShader(shaderProgram, fragmentShader);
    	gl.linkProgram(shaderProgram);
    	gl.useProgram(shaderProgram);
    	// 检查连接是否成功
    	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    		console.error('use program', gl.getProgramInfoLog(shaderProgram));
    		return null;
    	}
    	return shaderProgram;
    }
    // 创建着色器属性变量，返回属性指针
    static initAttribute(gl, prog, ay, name) {
    	// 创建缓存并附加数据
    	var buf = gl.createBuffer();
    	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    	gl.bufferData(gl.ARRAY_BUFFER, ay, gl.STATIC_DRAW);
    	// 获取数据为当前属性，这和设置缓存数据必须是一前一后的吗？
    	var ref = gl.getAttribLocation(prog, name);
    	gl.enableVertexAttribArray(ref);
    	gl.vertexAttribPointer(ref, 2, gl.FLOAT, false, 0, 0);
    	return ref;
    }
    // 创建纹理，返回指针
    static initTexture(gl) {
    	// 创建并绑定
    	var texture = gl.createTexture();
    	gl.bindTexture(gl.TEXTURE_2D, texture);
    	// 设置放大缩写方法为最近值，设置水平垂直方法为边缘值
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    	gl.bindTexture(gl.TEXTURE_2D, null);
    	return texture;
    }
    // 设置着色器一致性变量
    static initUniform1(gl, prog, id, name) {
    	var ref = gl.getUniformLocation(prog, name);
    	gl.uniform1i(ref, id);
    }
    // 设置一致性变量
    static initUniform4(gl, prog, matrix_ay, name) {
    	var ref = gl.getUniformLocation(prog, name);
    	gl.uniformMatrix4fv(ref, false, matrix_ay);
    }
    gl = null;
    texture0 = null;
    texture1 = null;
    texture2 = null;
    width;
    height;
    /**
     * @function 构建函数
     * @param canvas   页面元素
     * @param contextOptions  WebGL参数
     * @return bool
     */
    constructor(canvas, contextOptions = false) {
    	if (!canvas) {
    		return;
    	}
    	// 创建上下文，IE需要使用'experimental-webgl'，弃用IE
    	var gl = canvas.getContext('webgl', contextOptions || false);
    	if (!gl) {
    		console.error('not support webgl');
    		return;
    	}
    	this.gl = gl;
    	this.width = canvas.width;
    	this.height = canvas.height;
    	var program = PlayerRender.initShaderProgram(gl, PlayerRender.vertexShaderScript, PlayerRender.fragmentShaderScript);
    	PlayerRender.initUniform4(gl, program, PlayerRender.YUV2RGB, 'YUV2RGB');
    	PlayerRender.initAttribute(gl, program, new Float32Array([
    		1, 1, -1, 1, 1, -1, -1, -1
    	]), 'pos');
    	PlayerRender.initAttribute(gl, program, new Float32Array([
    		1, 0, 0, 0, 1, 1, 0, 1
    	]), 'dataPos');
    	this.texture0 = PlayerRender.initTexture(gl);
    	PlayerRender.initUniform1(gl, program, 0, 'ySampler');
    	this.texture1 = PlayerRender.initTexture(gl);
    	PlayerRender.initUniform1(gl, program, 1, 'uSampler');
    	this.texture2 = PlayerRender.initTexture(gl);
    	PlayerRender.initUniform1(gl, program, 2, 'vSampler');
    }

    /**
     * @function 渲染一次YUV420数据，数据使用Uint8Array，而非Uint8ClampedArray，将输入和256取模，而非取边界值
     * @param {array} cur_Y     y数据，长度需符合宽高
     * @param {array} cur_Cb    u数据，如上
     * @param {array} cur_Cr    v数据，如上
     * @param {int} width   画面宽度，如和canvas不一致将改变canvas属性
     * @param {int} height  画面高度，如上
     * @return void
     */
    render(cur_Y, cur_Cb, cur_Cr, width, height) {
    	if (!this.gl) {
    		return false;
    	}
    	var gl = this.gl;
    	var texture0 = this.texture0;
    	var texture1 = this.texture1;
    	var texture2 = this.texture2;
    	var yData = new Uint8Array(cur_Y);
    	var uData = new Uint8Array(cur_Cb);
    	var vData = new Uint8Array(cur_Cr);
    	// 改变显示区域的起始位置和大小，改变canvas后需要调用
    	if (!this.width) {
    		this.width = width;
    	}
    	if (!this.height) {
    		this.height = height;
    	}
    	if (this.width != width || this.height != height) {
    		gl.viewport(0, 0, width, height);
    		this.width = width;
    		this.height = height;
    	}
    	var w = width;
    	var h = height;
    	// 激活当前纹理，绑定为2D纹理，指定2D纹理图像。绑定是必须的吗？
    	gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, texture0);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, yData);
    	w = width / 2;
    	h = height / 2;
    	gl.activeTexture(gl.TEXTURE1);
    	gl.bindTexture(gl.TEXTURE_2D, texture1);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, uData);
    	gl.activeTexture(gl.TEXTURE2);
    	gl.bindTexture(gl.TEXTURE_2D, texture2);
    	gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, vData);
    	// 绘制矩阵
    	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}
class HGPlayerFrame {
    static MESSAGE = false;
    static CODE = {
    	CODE_VIEW_START: 1,
    	CODE_CONNECT_ERR: 2,
    	CODE_DECODE_ERR: 3,
    	CODE_RESOURCES: 4,
    	CODE_TRY: 5,
    	CODE_TRACK_CARD: 6,
    	CODE_TRACK_CARD_END: 7,
    	CODE_TRACK_ALARM: 6,
    	CODE_TRACK_ALARM_END: 7,
    	CODE_TRACK_FAILED: 8,
    	CODE_VIDEO_START: 8,
    	CODE_VIDEO_ERR: 9,
    	CODE_VIDEO_TIMEOUT: 10,
    	CODE_VIDEO_END: 11,
    	CODE_TIMEOUT_DECODE: 12,
    	CODE_TIMEOUT_HEART: 13,
    	CODE_PTZ_START: 15,
    	CODE_PTZ_ERR: 16,
    	CODE_PTZ_STOP: 17,
    	CODE_PAUSE: 18,
    	CODE_RESUME: 19,
    	CODE_CHANGE: 20 // 切换资源
    };
    static CODE_STR = {
    	1: 'ready for watch',
    	2: 'rtsp connect failed',
    	3: 'decode failed',
    	4: 'nead resource',
    	5: 'protocol failed',
    	12: 'decode timeout',
    	13: 'heart timeout',
    	20: 'change success',
    	6: 'tracking start',
    	7: 'tracking stop',
    	8: 'record start',
    	9: 'record failed',
    	10: 'record timeout',
    	11: 'record stop',
    	15: 'ptz start',
    	16: 'ptz failed',
    	17: 'ptz stop'
    };
    static msg = {
    	'init': '初始化',
    	'failed with wrong paramss': '初始化失败，参数错误',
    	'connecting': '链接中',
    	'connect failed': '链接失败',
    	'link succeed, waiting for data': '链接成功，等待数据',
    	'rtsp connect failed': 'rtsp地址连接错误',
    	'decode failed': '解码失败',
    	'need resources': '无可用资源',
    	'protocol failed': '通讯错误',
    	'decode timeout': '解码超时',
    	'heart timeout': '心跳超时',
    	'ready for watch': '准备观看',
    	'relinking': '重连中',
    	'disconnected': '断开链接',
    	'change success': '源变化',
    	'tracking start': '追踪开始',
    	'tracking stop': '追踪结束',
    	'record start': '录像开始',
    	'record failed': '录像失败',
    	'record timeout': '录像超时',
    	'record stop': '录像结束',
    	'ptz start': '云台开始',
    	'ptz failed': '云台失败',
    	'ptz stop': '云台停止',
    };
    static now() {
    	return (new Date()).toISOString();
    }
    static toText(utf8_code) {
    	return new TextDecoder('utf-8').decode(utf8_code);
    }
    static getMsg(msg) {
    	if (!this.MESSAGE && msg in this.msg) {
    		return this.msg[msg];
    	} else {
    		return msg;
    	}
    }
    static toMsg(code) {
    	if (code in this.CODE_STR) {
    		return this.CODE_STR[code];
    	} else {
    		return false;
    	}
    }
}
class HGPlayer {
    static CMD_SER_INFO = 80; // 额外的JSON字符串信息，例如设备信息、统计信息、流信息
    static CMD_SER_ERROR = 81; // 额外的字符串错误信息 以及将断开链接
    static CMD_SER_AUDIO = 82; // 音频消息
    static CMD_SER_VIDEO = 83; // 视频消息
    static WORKER_START = 1;
    static WORKER_DATA = 2;
    static WORKER_HEADER = 7;
    static WORKER_PICTURE = 8;
    success = false; // 表明是否创建成功
    err_msg = '';
    status = 'init'; // 初始化 connecting 开始连接 connected 连接成功并创建心跳
    // play 已获取数据 rending 渲染中 closed 连接已关闭并清除心跳 destroy 销毁或不再重连
    parent_div;
    div;
    loading_div;
    render;
    source;
    decoder;
    is_max_reso = false;
    source_url;
    video_type;
    socket_url;
    user_params = {
    	'source_url': '', 'video_type': '', 'user': '', 'pwd': '',
    	'width': 0, 'height': 0,
    	'alarm_id': 0, 'card_id': 0, 'uuid': 0,
    	'nvr_id': 0, 'chan_id': 0, 'camera_id': 0,
    	'time_start': 0, 'time_end': 0
    };
    canvas;
    mse_flag = false;
    onopen_cb; // 初始化回调
    oninit_cb;
    oninfo_cb;
    onerror_cb;
    ondecode_cb;
    onstats_cb;
    stats_timer;
    heart_timer;
    stats_now = {time: 0, size: 0, n: 0};
    stats_old = {time: 0, size: 0, n: 0};
    log_flag = false;
    log_ul;
    log = [];
    addLog(msg) {
    	// msg = HGPlayerFrame.now() + ' ' + msg;
    	this.log.push(msg);
    	if (this.log_ul) {
    		var li = document.createElement('li');
    		li.innerText = msg;
    		this.log_ul.appendChild(li);
    	}
    	if (this.log_ul.childElementCount > 10) {
    		for (var i = 0; i < 3; i++) {
    			this.log_ul.removeChild(this.log_ul.firstChild);
    		}
    	}
    }
    getLog() {
    	return this.log;
    }
    /**
     * @function 构建函数
     * @param parent_div  页面元素，必选
     * @param video_type  转换类型，必选，h264、mpeg1、yushi、play、mp4
     * @param source_url  类型为h264、yushi时必选，为摄像机RTSP地址，类型为mp4时必选，为文件WEB地址
     * @param sock_url    服务器地址，仅类型为mp4时可为空
     * @param opts        参数
     *
     * opts参数有
     * user password width height
     * card_id alarm_id time_start time_end
     * onstatistic ({time, size, fps}) 间隔毫秒时长 间隔所接受字节量 间隔内帧数
     * onopen ()
     * oninfo ({code, msg})
     * onerror (msg)
     * ondecode ({cmd, data: {yuv: Uint8Array(460800), is_idr: 0, num: 6, w: 640, h: 480}})
     *
     * 实时 (div, 'h264', 'rtsp://...', 'ws://localhost:9100', {'width':480,'height':320})
     * 回放 (div, 'play', '', 'ws://localhost:9100', {'width':480,'height':320,'uuid':1})
     * 追踪 (div, 'h264', '', 'ws://localhost:9100', {'width':480,'height':320,'card_id':9527})
     *
     * 失败时，对象的success属性为false
     */
    constructor(parent_div, video_type, source_url, sock_url, opts) {
    	if (!parent_div || !video_type || !sock_url) {
    		this.err_msg = HGPlayerFrame.getMsg('failed with wrong paramss');
    		return;
    	}
    	if (!source_url && (opts.uuid || opts.card_id)) {
    		this.err_msg = HGPlayerFrame.getMsg('failed with wrong paramss');
    		return;
    	}
    	this.parent_div = parent_div;
    	this.video_type = video_type;
    	this.source_url = source_url;
    	this.socket_url = sock_url;
    	this.onstats_cb = opts.onstatistic || false;
    	this.onopen_cb = opts.onopen || false;
    	this.oninit_cb = opts.oninit || false;
    	this.oninfo_cb = opts.oninfo || false;
    	this.onerror_cb = opts.onerror || false;
    	this.ondecode_cb = opts.ondecode || false;
    	this.user_params = {
    		'width': parseInt(opts.width, 10) || 640,
    		'height': parseInt(opts.height, 10) || 480,
    		'alarm_id': parseInt(opts.alarm_id, 10),
    		'card_id': parseInt(opts.card_id, 10),
    		'uuid': parseInt(opts.uuid, 10),
    		'nvr_id': parseInt(opts.nvr_id, 10),
    		'chan_id': parseInt(opts.chan_id, 10),
    		'camera_id': parseInt(opts.camera_id, 10),
    		'time_start': parseInt(opts.time_start, 10),
    		'time_end': parseInt(opts.time_end, 10),
    		'source_url': source_url,
    		'video_type': video_type,
    		'user': opts.user || '',
    		'pwd': opts.password || ''
    	};
    	// if (this.user_params.source_url.indexOf("rtsp://") == 0) {
    	//     if (this.user_params.source_url.indexOf("@") < 0 && this.user_params.user && this.user_params.pwd) {
    	//         this.user_params.source_url = "rtsp://" + this.user_params.user + ":" + this.user_params.pwd + "@" + this.user_params.source_url.slice(7);
    	//     }
    	// }
    	this.initDiv();
    	this.addLog(HGPlayerFrame.getMsg('init'));
    	this.open(this.user_params);
    	this.success = true;
    }
    // 创建画面canvas、日志div、外部div
    initDiv() {
    	this.div = document.createElement('div');
    	this.parent_div.appendChild(this.div);
    	this.div.className = 'hg_player_content';
    	this.loading_div = document.createElement('div');
    	this.div.appendChild(this.loading_div);
    	this.loading_div.className = 'hg_player_loading_div';
    	this.log_ul = document.createElement('ul');
    	this.loading_div.appendChild(this.log_ul);
    	this.log_ul.className = 'hg_player_log';
    	const loading_icon = document.createElement('div');
    	loading_icon.className = 'hg_player_loading_icon';
    	for (let i = 0; i < 8; i++) {
    		loading_icon.appendChild(document.createElement('span'));
    	}
    	this.loading_div.appendChild(loading_icon);
    }
    // 隐藏或开启日志、加载界面
    showDiv() {
    	if (!this.div.contains(this.loading_div)) {
    		this.div.appendChild(this.loading_div);
    	}
    	// if (!this.div.contains(this.log_ul)) {
    	//     this.div.appendChild(this.log_ul)
    	// }
    }
    hideDiv() {
    	if (this.div.contains(this.loading_div)) {
    		this.div.removeChild(this.loading_div);
    	}
    	// if (this.div.contains(this.log_ul)) {
    	//     this.div.removeChild(this.log_ul)
    	// }
    }
    // 截图封装
    getImage(evt) {
    	if (this.canvas) {
    		var image = new Image();
    		image.src = this.canvas.toDataURL("image/png");
    		if (evt) {
    			evt(image);
    			return true;
    		} else {
    			return image;
    		}
    	}
    }
    // 通信回调 成功连接后请求数据，断开后显示错误，接到数据后渲染
    sourceOpen(msg) {
    	// TODO
    	// console.log(msg) // {protocol: "", status: 1, url: "ws://localhost:9100/"}
    	this.status = 'connected';
    	// this.addLog(msg.url)
    	this.addLog(HGPlayerFrame.getMsg('link succeed, waiting for data'));
    	this.sendStart(this.user_params);
    	if (!this.heart_timer) {
    		this.heart_timer = setInterval(function () {
    			this.source.send("HGV001\x00\x06\x00\x00\x00\x18Hear\x00\x00\x00\x0CTrue");
				this.source.message_heart2 = Math.round(performance.now() / 1000);
    		}.bind(this), 1 * 1000);
    	}
    }
    sourceClose(msg) {
    	// TODO
    	// console.log(msg) // code: 1006, reason: "", recount: 3 // reconnet: 2 // {code: 1000, reason: "", recount: 0}
    	this.status = 'closed';
    	// 这将不会再次重连
    	if (this.source.reconnect_number == 0) {
    		this.status = 'destroy';
    		this.success = false;
    	}
    	if (msg.code == 0) {
    		this.addLog(HGPlayerFrame.getMsg('relinking'));
    	} else if (msg.code == 1000) {
    		this.addLog(HGPlayerFrame.getMsg('disconnected'));
    	} else if (msg.code == 1006) {
    		this.addLog(HGPlayerFrame.getMsg('connect failed'));
    	} else {
    		console.log('undefined ws code', msg);
    	}
    	this.showDiv();
    	if (this.heart_timer) {
    		clearInterval(this.heart_timer);
    		this.heart_timer = null;
    	}
    }
    sourceMsg(msg) {
    	if (msg[0] == 72 && msg[1] == 71 && msg[2] == 86 && msg[3] == 48) {
    		var code = msg[6] * 256 + msg[7];
    		if (code in HGPlayerFrame.CODE_STR) {
    			var m = HGPlayerFrame.toMsg(code);
    			this.addLog(HGPlayerFrame.getMsg(m));
    			// TODO
    			if (code >= 6 && code <= 20) {
    				console.log(m);
    			}
    			if (code == 11) {
    				var info = msg.slice(12);
    				info = HGPlayerFrame.toText(info);
    				this.oninfo_cb({"code": code, "msg": info});
    			} else {
    				this.oninfo_cb({"code": code, "msg": m});
    			}
    		}
    		console.log('recv msg', code);
    		// if (code == HGPlayer.CMD_SER_AUDIO) {}
    		if (code == HGPlayer.CMD_SER_INFO) {
    			var info = msg.slice(12);
    			info = HGPlayerFrame.toText(info);
    			// TODO
    			this.oninfo_cb({'code': code, 'msg': info});
    		} else if (code == HGPlayer.CMD_SER_ERROR) {
    			// TODO
    			var info = msg.slice(12);
    			info = HGPlayerFrame.toText(info);
    			this.onerror_cb(info);
    		} else if (code == HGPlayer.CMD_SER_VIDEO) {
    			// TODO
    		}
    	} else {
    		if (this.status == 'connected') {
    			this.status = 'play';
    			// this.addLog(HGPlayerFrame.getMsg('ready for watch'))
    			this.onopen_cb();
    			this.hideDiv();
    		}
    		this.decoder.postMessage({cmd: HGPlayer.WORKER_DATA, data: msg});
    	}
    	this.stats_now.size += msg.length;
    }
    // 流程控制 缺失收到数据后的状态，以及后台解码时间，后台映射错误信息
    open(info) {
    	// this.addLog(this.socket_url);
    	this.canvas = document.createElement('canvas');
    	this.canvas.width = info.width;
    	this.canvas.height = info.height;
    	this.canvas.style.backgroundColor = '#0D0E1B';
    	this.div.appendChild(this.canvas);
    	this.status = "connecting";
    	this.render = new PlayerRender(this.canvas, {preserveDrawingBuffer: true});
    	this.source = new PlayerSource(this.socket_url);
    	this.source.cb_open = this.sourceOpen.bind(this);
    	this.source.cb_msg = this.sourceMsg.bind(this);
    	this.source.cb_close = this.sourceClose.bind(this);
    	this.decoder = new Worker({name: 'avc'});
    	this.oninit_cb && this.oninit_cb();
    	// console.log('start');
    	this.decoder.onerror = function (ev) {
    		console.log(['ERROR: Line ', ev.lineno, ' in ', ev.filename, ': ', ev.message].join(''));
    		this.decoder.terminate();
    	}.bind(this);
    	this.decoder.onmessage = function (ev) {
    		var data = ev.data;
    		if (data.cmd == HGPlayer.WORKER_PICTURE) {
    			var w = data.data.w;
    			var h = data.data.h;
    			var size = w * h;
    			var y = data.data.yuv.slice(0, size);
    			var u = data.data.yuv.slice(size, size * 1.25);
    			var v = data.data.yuv.slice(size * 1.25, size * 1.5);
    			if (this.render) {
    				this.render.render(y, u, v, w, h);
    			}
    			this.stats_now.n += 1;
    			if (this.ondecode_cb) {
    				this.ondecode_cb(data);
    			}
    			if (this.status == 'play') {
    				this.status = 'rending';
    				// TODO
    				// this.oninfo_cb({ code: 1, msg: '' })
    			}
    		}
    	}.bind(this);
    	this.stats_timer = setInterval(function () {
    		this.stats_now.time = Math.round(performance.now());
    		var t = this.stats_now.time - this.stats_old.time;
    		var s = this.stats_now.size - this.stats_old.size;
    		var n = this.stats_now.n - this.stats_old.n;
    		if (this.onstats_cb) {
    			// TODO 缺少解码耗时
    			this.onstats_cb({'time': t, 'size': s, 'fps': n});
    		}
    		this.stats_old.time = this.stats_now.time;
    		this.stats_old.size = this.stats_now.size;
    		this.stats_old.n = this.stats_now.n;
    	}.bind(this), 1000);
    }
    sendStart(info) {
    	if (info.source_url.indexOf("rtsp://") == 0) {
    		if (info.source_url.indexOf("@") < 0 && info.user && info.pwd) {
    			info.source_url = "rtsp://" + info.user + ":" + info.pwd + "@" + info.source_url.slice(7);
    		}
    	}

    	var sock_msg = info.width.toString() + "\x2a" + info.height.toString();
    	sock_msg = "Reso" + "\x00\x00\x00" + String.fromCharCode(sock_msg.length + 8) + sock_msg;
    	if (info.alarm_id) {
    		var alarm_id = "\x20\x20\x20\x20";
    		alarm_id = info.alarm_id.toString();
    		alarm_id = "Alar" + "\x00\x00\x00" + String.fromCharCode(alarm_id.length + 8) + alarm_id;
    		sock_msg += alarm_id;
    	}
    	if (info.card_id) {
    		var card_id = "\x20\x20\x20\x20";
    		card_id = info.card_id.toString();
    		card_id = "Card" + "\x00\x00\x00" + String.fromCharCode(card_id.length + 8) + card_id;
    		sock_msg += card_id;
    	}
    	if (info.source_url) {
    		var equip_url = "Rtsp" + "\x00\x00\x00";
    		equip_url += String.fromCharCode(info.source_url.length + 8) + info.source_url;
    		sock_msg += equip_url;
    	}
    	if (info.video_type) {
    		var equip_type = "Type" + "\x00\x00\x00";
    		equip_type += String.fromCharCode(info.video_type.length + 8) + info.video_type;
    		sock_msg += equip_type;
    	}
    	if (info.time_start && info.time_end) {
    		var span = info.time_start + "\x2a" + info.time_end;
    		span = "Span" + "\x00\x00\x00" + String.fromCharCode(span.length + 8) + span;
    		sock_msg += span;
    	}
    	if (info.nvr_id && info.chan_id) {
    		var nvr_id = info.nvr_id.toString();
    		var equip_url = "Nvr_" + "\x00\x00\x00";
    		equip_url += String.fromCharCode(nvr_id.length + 8) + nvr_id;
    		sock_msg += equip_url;
    		var chan_id = info.chan_id.toString();
    		equip_url = "Chan" + "\x00\x00\x00";
    		equip_url += String.fromCharCode(chan_id.length + 8) + chan_id;
    		sock_msg += equip_url;
    	}
    	var sock_msg_len = sock_msg.length + 12;
    	var sock_msg_len_str;
    	if (sock_msg_len < 256) {
    		sock_msg_len_str = "\x00\x00\x00" + String.fromCharCode(sock_msg_len);
    	} else {
    		sock_msg_len_str = "\x00\x00" + String.fromCharCode(sock_msg_len / 256) + String.fromCharCode(sock_msg_len % 256);
    	}
    	if (this.video_type == "play") {
    		sock_msg = "HGV001\x00\x11" + sock_msg_len_str + sock_msg;
    	} else {
    		sock_msg = "HGV001\x00\x01" + sock_msg_len_str + sock_msg;
    	}
    	this.source.send(sock_msg);
    }
    close() {
    	console.log('stop');
    	if (this.source) {
    		this.source.destroy();
    	}
    	if (this.decoder) {
    		this.decoder.terminate();
    	}
    	this.parent_div.removeChild(this.div);
    	this.is_max_reso = false;
    	if (this.stats_timer) {
    		clearInterval(this.stats_timer);
    		this.stats_timer = null;
    	}
    	if (this.heart_timer) {
    		clearInterval(this.heart_timer);
    		this.heart_timer = null;
    	}
    	this.success = false;

		var gl = this.canvas.getContext('webgl');
		gl.deleteTexture(this.render.texture0);
		gl.deleteTexture(this.render.texture1);
		gl.deleteTexture(this.render.texture2);
    }
    // 暂停 尚未完成
    pause() { }
    resume() { }
    // 重装 尚未完成
    reloadOpts(url, username = false, password = false) {
    	// TODO username, password,
    	// 如果在重连，则会更换参数并立刻重连，如果已经失败，则会关闭并返回，
    	// 上层丢弃已经关闭的对象，重新创建，或者增加首页的重连次数 PlayerSource.reconnect_number
    	// 为什么现在不会在创建时传递这个参数了？
    	if (this.status == 'destroy') {
    		return 'destroy';
    	}
    	if (url) {
    		this.user_params.source_url = url;
    		if (username && password) {
    			this.user_params.user = username;
    			this.user_params.pwd = password;
    		}
    		this.sendStart(this.user_params);
    	}
    }
    // 最大化或仅改变分辨率 尚未完成
    changeResolution(opts) {
    	if (opts.width == -1 && opts.height == -1 && this.is_max_reso) {
    		return true;
    	}
    	if (opts.width == this.user_params.width && opts.height == this.user_params.height) {
    		return true;
    	}
    	this.user_params.width = opts.width;
    	this.user_params.height = opts.height;
    	this.is_max_reso = true;
    	// this.open();
    }
    // 录像
    startRecord() {
    	return this.source.send("HGV001\x00\x07\x00\x00\x00\x18Hear\x00\x00\x00\x0CTrue");
    }
    stopRecord() {
    	return this.source.send("HGV001\x00\x0a\x00\x00\x00\x18Hear\x00\x00\x00\x0CTrue");
    }
    // 追踪
    startTrack() {
    	return this.source.send("HGV00F\x00\x06\x00\x00\x00\x18Hear\x00\x00\x00\x0CTrue");
    }

    stopTrack() {
    	return this.source.send("HGV010\x00\x06\x00\x00\x00\x18Hear\x00\x00\x00\x0CTrue");
    }

    // 云台
    moveRelative(opts) {
    	var info = JSON.stringify({
    		'ip': opts.ip,
    		'port': opts.port,
    		'user': opts.user,
    		'pwd': opts.pwd,
    		'right_speed': opts.right_speed,
    		'up_speed': opts.up_speed,
    		'far_speed': opts.far_speed
    	});
    	if (info.length > 256 || info.length < 8) {
    		return false;
    	}
    	return this.sendEx(info, "Turn", "\x0C");
    }
    moveStop(opts) {
    	var info = JSON.stringify({
    		'ip': opts.ip,
    		'port': opts.port,
    		'user': opts.user,
    		'pwd': opts.pwd
    	});
    	if (info.length > 256 || info.length < 8) {
    		return false;
    	}
    	return this.sendEx(info, "Turn", "\x0D");
    }
    // 回放 card_id实际是指uuid
    sendTime(opts) {
    	var info = JSON.stringify({
    		// 'card_id': opts.card_id,
    		'utime': opts.utime
    	});
    	if (info.length > 256 || info.length < 8) {
    		return false;
    	}
    	return this.sendEx(info, "Back", "\x13");
    }
    sendSpeed(opts) {
    	var info = JSON.stringify({
    		'card_id': opts.card_id,
    		'speed': opts.speed
    	});
    	if (info.length > 256 || info.length < 8) {
    		return false;
    	}
    	return this.sendEx(info, "Fast", "\x13");
    }
    // 发送
    sendEx(msg, type, code) {
    	var sock_params_len = String.fromCharCode(msg.length + 8);
    	var sock_params = type + "\x00\x00\x00" + sock_params_len + msg;
    	sock_params_len = String.fromCharCode(sock_params.length + 12);
    	sock_params = "HGV001\x00" + code + "\x00\x00\x00" + sock_params_len + sock_params;
    	return this.source.send(sock_params);
    }
}
export default HGPlayer;
// # sourceMappingURL=player.js.map
