import { YIN } from 'pitchfinder';


// 调音音高检测
export async function startTuner(callback: (res: { noteName: string; deviation: number; pitch: number }) => void) {
  const SampleRate = 44100, FftSize = 4096 // 采样率, FFT 大小

  let stream: MediaStream | null = null
  try {
    // 1.  请求麦克风权限并获取音频流
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
        sampleRate: SampleRate,
        sampleSize: 16
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
  analyser.fftSize = FftSize; // 设置 FFT 大小，影响分析精度和频率分辨率
  analyser.smoothingTimeConstant = 0.3; // 设置平滑时间常量，影响分析的响应速度
  source.connect(analyser);
  // 5. 创建缓冲区
  const buffer = new Float32Array(analyser.fftSize);
  const detectPitch = YIN({
    sampleRate: audioContext.sampleRate,
    threshold: 0.1,
    probabilityThreshold: 0.8,
  });



  // 6. 分析音频数据
  const analyzePitch = () => {

    analyser.getFloatTimeDomainData(buffer);

    const pitch = detectPitch(buffer);

    if (pitch) {
      const pitchNum = Number(pitch.toFixed(2))

      // 过滤异常频率
      if (pitchNum < 65 || pitchNum > 2093) {
        callback({
          noteName: "---",
          deviation: 0,
          pitch: 0
        })
        return
      }

      const noteName = frequencyToNoteName(pitchNum)
      callback({
        noteName: noteName.noteName,
        deviation: noteName.deviation,
        pitch: pitchNum
      })
    } else {
      callback({
        noteName: "---",
        deviation: 0,
        pitch: 0
      })
    }
  };
  // 性能优化相关
  const UPDATE_INTERVAL = 150; // 150ms 更新一次
  setInterval(() => {
    analyzePitch()
  }, UPDATE_INTERVAL)
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