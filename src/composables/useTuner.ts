import { AMDF } from 'pitchfinder';


export async function useTuner() {
  let stream: MediaStream | null = null
  try {
    // 1.  请求麦克风权限并获取音频流
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })
  } catch (error) {
    console.error('获取麦克风权限失败:', error);
    stream = null
    return;
  }
  // 2. 初始化音频上下文
  const audioContext = new AudioContext();
  // 3. 将麦克风输入连接到音频上下文
  const source = audioContext.createMediaStreamSource(stream);
  // 4. 创建分析器
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048; // 设置 FFT 大小，影响分析精度和频率分辨率
  // analyser.smoothingTimeConstant = 0.1; // 设置平滑时间常量，影响分析的响应速度
  source.connect(analyser);
  // 5. 创建缓冲区
  const buffer = new Float32Array(analyser.fftSize);
  const detectPitch = AMDF({
    minFrequency: 50,
    maxFrequency: 5000,
  });


  let lastTime = 0
  const interval = 50

  // 6. 分析音频数据
  const analyzePitch = (time: number) => {
    requestAnimationFrame(analyzePitch)
    // 节流器
    if (time - lastTime < interval) return
    lastTime = time

    analyser.getFloatTimeDomainData(buffer);
    // 1. 音量过滤 - 计算RMS能量
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);

    // 音量阈值 - 需要根据实际环境调整
    const volumeThreshold = 0.02;

    if (rms < volumeThreshold) return; // 音量太小


    const pitch = detectPitch(buffer);
    // 过滤噪音

    if (pitch) {
      console.log(pitch.toFixed(2))
    }
  };
  requestAnimationFrame(analyzePitch)
}