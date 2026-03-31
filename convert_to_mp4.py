# convert_to_mp4.py - WebM 转 MP4
import sys
import os

try:
    from moviepy.editor import VideoFileClip
except ImportError:
    print("请先安装 moviepy: pip install moviepy")
    sys.exit(1)

def convert_webm_to_mp4(input_path, output_path=None):
    """将 WebM 转换为 MP4"""
    if not os.path.exists(input_path):
        print(f"错误: 找不到文件 {input_path}")
        return False

    if output_path is None:
        output_path = input_path.rsplit('.', 1)[0] + '.mp4'

    print(f"正在转换: {input_path} -> {output_path}")

    try:
        clip = VideoFileClip(input_path)
        clip.write_videofile(
            output_path,
            codec='libx264',
            audio_codec='aac',
            fps=60,
            preset='medium',
            threads=4
        )
        clip.close()
        print(f"✅ 转换完成: {output_path}")
        return True
    except Exception as e:
        print(f"转换失败: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python convert_to_mp4.py <input.webm> [output.mp4]")
        print("示例: python convert_to_mp4.py promo.webm")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    convert_webm_to_mp4(input_file, output_file)