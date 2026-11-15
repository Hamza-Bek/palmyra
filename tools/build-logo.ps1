# Builds transparent logo variants from the original dark-background artwork.
# Usage: powershell -File tools\build-logo.ps1 -Source "path\to\logo-original.jpg"
#
# The artwork is a single flat colour on a flat dark background, so each pixel's
# position between "background" and "ink" becomes its alpha. The ink is then
# repainted in any colour we need (deep blue for light pages, sky blue for dark).

param(
  [Parameter(Mandatory = $true)][string]$Source,
  [string]$OutDir
)

if (-not $OutDir) {
  $OutDir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\assets\images\brand"
}

Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class LogoBuilder {
  // Returns a 32-bit bitmap of `crop`, ink repainted with `ink`, background transparent.
  public static Bitmap Extract(Bitmap src, Rectangle crop, Color ink) {
    Bitmap dst = new Bitmap(crop.Width, crop.Height, PixelFormat.Format32bppArgb);
    BitmapData s = src.LockBits(crop, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    BitmapData d = dst.LockBits(new Rectangle(0, 0, crop.Width, crop.Height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    byte[] sb = new byte[s.Stride * crop.Height];
    byte[] db = new byte[d.Stride * crop.Height];
    Marshal.Copy(s.Scan0, sb, 0, sb.Length);

    // Background and ink colours sampled from the artwork (B, G, R)
    double[] bg = { 43, 40, 38 };
    double[] fg = { 234, 200, 88 };
    double[] v = { fg[0] - bg[0], fg[1] - bg[1], fg[2] - bg[2] };
    double len2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];

    for (int y = 0; y < crop.Height; y++) {
      for (int x = 0; x < crop.Width; x++) {
        int si = y * s.Stride + x * 3;
        int di = y * d.Stride + x * 4;
        double t = ((sb[si] - bg[0]) * v[0] + (sb[si + 1] - bg[1]) * v[1] + (sb[si + 2] - bg[2]) * v[2]) / len2;
        t = (t - 0.10) / 0.80;               // trim JPEG noise at both ends
        if (t < 0) t = 0; if (t > 1) t = 1;
        db[di] = ink.B; db[di + 1] = ink.G; db[di + 2] = ink.R;
        db[di + 3] = (byte)Math.Round(t * 255);
      }
    }
    Marshal.Copy(db, 0, d.Scan0, db.Length);
    src.UnlockBits(s);
    dst.UnlockBits(d);
    return dst;
  }

  public static void Save(Bitmap bmp, int height, string path) {
    int width = (int)Math.Round(bmp.Width * (height / (double)bmp.Height));
    using (Bitmap outBmp = new Bitmap(width, height, PixelFormat.Format32bppArgb))
    using (Graphics g = Graphics.FromImage(outBmp)) {
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      g.CompositingQuality = CompositingQuality.HighQuality;
      g.DrawImage(bmp, new Rectangle(0, 0, width, height));
      outBmp.Save(path, ImageFormat.Png);
    }
  }

  // Square icon: ink artwork centred on a rounded, filled tile.
  public static void SaveIcon(Bitmap art, int size, Color tile, string path) {
    using (Bitmap outBmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
    using (Graphics g = Graphics.FromImage(outBmp)) {
      g.SmoothingMode = SmoothingMode.AntiAlias;
      g.InterpolationMode = InterpolationMode.HighQualityBicubic;
      g.PixelOffsetMode = PixelOffsetMode.HighQuality;
      int r = size / 4;
      using (GraphicsPath p = new GraphicsPath()) {
        p.AddArc(0, 0, r * 2, r * 2, 180, 90);
        p.AddArc(size - r * 2, 0, r * 2, r * 2, 270, 90);
        p.AddArc(size - r * 2, size - r * 2, r * 2, r * 2, 0, 90);
        p.AddArc(0, size - r * 2, r * 2, r * 2, 90, 90);
        p.CloseFigure();
        using (SolidBrush b = new SolidBrush(tile)) g.FillPath(b, p);
      }
      int pad = (int)(size * 0.16);
      g.DrawImage(art, new Rectangle(pad, pad, size - 2 * pad, size - 2 * pad));
      outBmp.Save(path, ImageFormat.Png);
    }
  }
}
"@

New-Item -ItemType Directory -Force $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path
$src = New-Object System.Drawing.Bitmap $Source

$deepBlue = [System.Drawing.ColorTranslator]::FromHtml("#0b6fa0")   # for light backgrounds
$skyBlue  = [System.Drawing.ColorTranslator]::FromHtml("#58c8ea")   # original, for dark backgrounds
$white    = [System.Drawing.Color]::White

# Regions of the 1563×1563 artwork
$wordmark = New-Object System.Drawing.Rectangle 140, 495, 1235, 485    # "palmyra" + plane emblem
$full     = New-Object System.Drawing.Rectangle 140, 495, 1260, 615    # … plus rule and tagline
$emblem   = New-Object System.Drawing.Rectangle 1186, 735, 190, 196    # plane emblem only

$bmp = [LogoBuilder]::Extract($src, $wordmark, $deepBlue); [LogoBuilder]::Save($bmp, 220, "$OutDir\logo-wordmark-blue.png"); $bmp.Dispose()
$bmp = [LogoBuilder]::Extract($src, $wordmark, $skyBlue);  [LogoBuilder]::Save($bmp, 220, "$OutDir\logo-wordmark-sky.png");  $bmp.Dispose()
$bmp = [LogoBuilder]::Extract($src, $full, $deepBlue);     [LogoBuilder]::Save($bmp, 400, "$OutDir\logo-full-blue.png");     $bmp.Dispose()
$bmp = [LogoBuilder]::Extract($src, $full, $skyBlue);      [LogoBuilder]::Save($bmp, 400, "$OutDir\logo-full-sky.png");      $bmp.Dispose()
$bmp = [LogoBuilder]::Extract($src, $emblem, $white)
[LogoBuilder]::SaveIcon($bmp, 192, $deepBlue, "$OutDir\..\..\icons\favicon.png")
[LogoBuilder]::SaveIcon($bmp, 180, $deepBlue, "$OutDir\..\..\icons\apple-touch-icon.png")
$bmp.Dispose(); $src.Dispose()

Get-ChildItem $OutDir, "$OutDir\..\..\icons" -File | ForEach-Object { "{0,8}  {1}" -f $_.Length, $_.Name }
