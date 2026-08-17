# Motion-control workflow guide (Seedance 2.0 & friends)

This guide explains how to go from a raw clip to a generated motion-transfer video using the exports of Depth Video Studio. Terminology differs slightly per platform (Seedance calls it 动作控制/motion control; Kling, Vidu, Wan and ComfyUI call it control video / depth sequence), but the recipe is the same.

## 0. Pick a good source clip

- **5–15 seconds**, one person, mostly full body in frame
- Stable exposure; avoid heavy motion blur (blurred limbs → wobbly depth edges)
- Vertical 9:16 for short-video platforms; the export keeps your source resolution (capped at 1920 px on the long edge)

## 1. Recommended settings in Depth Video Studio

| Setting | Value | Why |
| --- | --- | --- |
| 分析帧率 Analysis fps | 24 (30 for fast motion) | matches typical generation fps |
| 时序平滑 Smoothing | **Light** | mono-depth jitters frame-to-frame; EMA smoothing keeps the control signal stable, which noticeably reduces flicker in the generated video |
| 深度渲染 Colormap | Grayscale | what depth-control pipelines expect; Inferno is for human eyes / comparisons |
| 姿态背景 Pose bg | **Pure black** when exporting skeletons | the standard "control format" (like OpenPose-style input) |
| 码率 Bitrate | 8–16 Mbps | compression artifacts in the *control* video leak into the generation |

## 2. Export the control video

- **Depth control** (recommended default): mode 灰度深度图. Depth preserves body shape + spatial layout + camera motion, and tolerates occlusions.
- **Pose control** (limb accuracy): mode 姿态骨架 + 纯黑背景. Skeletons lock joint angles precisely but carry no body shape; some platforms generate a "stick-figure" look if you don't pair it with a strong reference image.
- **Face**: mode 面部478点云, useful as expression reference or for talking-head workflows.

Switching modes reuses the analysis cache: export depth, then skeleton, each export costs only the clip's real-time duration.

## 3. Feed the generator (Seedance 2.0 example)

1. Open Seedance 2.0 and pick the motion-control / 视频转绘 mode.
2. **Reference / first frame**: your character image (the person you want to appear). Keep its aspect ratio equal to the control video's.
3. **Motion / control video**: the depth MP4 exported here.
4. Prompt for what should change (outfit, scene, style) — the pose/depth signal carries "what the body does", so spend the prompt on "who and where".
5. Generate. If limbs drift: re-export with stronger smoothing; if the output flickers: lower analysis fps to 15 and raise bitrate.

The exported file keeps the original audio. That is convenient for previews; generators ignore (or strip) it.

## 4. Also works with

- **Kling / Vidu / Wan motion control** — same depth/pose inputs
- **Runway / Pika** style-reference flows — use the skeleton-on-black clip as motion reference where supported
- **ComfyUI** — the depth sequence from any DA-V2 node is interchangeable; use this tool when you want a zero-install path or a quick previz
- **Sports & fitness content** — the depth + pose overlay makes strong before/after B-roll for training videos

## FAQ

**Why is my depth export flickering?** Make sure 时序平滑 is Light or Strong. Per-frame mono-depth always jitters slightly; the EMA smoothing exists precisely for control-video use.

**Analysis is slow.** Use Chrome/Edge (WebGPU). Without WebGPU the app falls back to WASM — lower the analysis fps to 10–15, the export still plays at full fps.

**Can I use a vertical phone video?** Yes, any aspect; the export keeps it. Just match the generation aspect to it.

**Does my video get uploaded?** No. Models are downloaded to *your* browser; inference is local. You can disconnect from the network after the first run (models are cached).
