import { AMDF } from 'pitchfinder';


// 调音音高检测
export async function useTuner(callback: (res: { noteName: string; deviation: number; pitch: number }) => void) {
  let stream: MediaStream | null = null
  try {
    // 1.  请求麦克风权限并获取音频流
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
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
  analyser.fftSize = 4096; // 设置 FFT 大小，影响分析精度和频率分辨率
  analyser.smoothingTimeConstant = 0.3; // 设置平滑时间常量，影响分析的响应速度
  source.connect(analyser);
  // 5. 创建缓冲区
  const buffer = new Float32Array(analyser.fftSize);
  const detectPitch = AMDF({
    minFrequency: 65,
    maxFrequency: 2093,
    sampleRate: audioContext.sampleRate,
  });


  // 性能优化相关

  let lastUpdateTime = 0;
  const UPDATE_INTERVAL = 150; // 15ms 更新一次 UI

  // 6. 分析音频数据
  const analyzePitch = (time: number) => {
    requestAnimationFrame(analyzePitch)
    // 节流器
    if (time - lastUpdateTime < UPDATE_INTERVAL) {
      return
    }
    lastUpdateTime = time

    analyser.getFloatTimeDomainData(buffer);
    // 1. 音量过滤 - 计算RMS能量
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);

    // 音量阈值 - 需要根据实际环境调整
    const volumeThreshold = 0.02;

    if (rms < volumeThreshold) {
      callback({
        noteName: "---",
        deviation: 0,
        pitch: 0
      })
      return
    }; // 音量太小


    const pitch = detectPitch(buffer);
    // 过滤噪音

    if (pitch) {
      const pitchNum = Number(pitch.toFixed(2))
      const noteName = frequencyToNoteName(pitchNum)
      callback({
        noteName: noteName.noteName,
        deviation: noteName.deviation,
        pitch: pitchNum
      })
    }
  };
  requestAnimationFrame(analyzePitch)
}

function frequencyToNoteName(frequency: number): { noteName: string; deviation: number; } {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;
  // 修正公式：使用正确的12平均律计算
  const noteNumber = 12 * Math.log2(frequency / A4) + 69;
  const noteName = noteNames[Math.round(noteNumber) % 12];
  // 计算音分偏差
  const deviation = (noteNumber - Math.round(noteNumber)) * 100

  const octave = Math.floor(Math.round(noteNumber) / 12) - 1; // 调整八度
  return {
    noteName: `${noteName}${octave}`,
    deviation
  }

}