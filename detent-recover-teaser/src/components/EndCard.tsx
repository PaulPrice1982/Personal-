import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import film from '../config/film.config';
import { colours, fonts, unit } from '../lib/theme';

const fade = (t: number, at: number, d = 0.8) =>
  interpolate(t, [at, at + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

// Logo source is 2000×318 (Detent Recover lock-up, transparent background).
const LOGO_RATIO = 2000 / 318;

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = 53 + frame / fps; // sequence starts at 53s
  const u = unit(W, H);
  const e = film.endCard, b = film.brand;
  const light = b.endCardTheme === 'light';
  const fg = light ? colours.ink : colours.paper;
  const sub = light ? colours.slate : colours.muted;
  const ground = light
    ? `radial-gradient(ellipse at 50% 42%, #FFFFFF 0%, ${colours.paper} 55%, #E4E7EB 100%)`
    : `radial-gradient(ellipse at 50% 45%, #141920 0%, ${colours.ink} 70%)`;

  const logoW = Math.min(W * (W > H ? 0.46 : 0.8), 1100 * u);
  const logoIn = fade(t, e.wordmarkAt, 1.1);
  const line = interpolate(t, [e.wordmarkAt + 0.4, e.wordmarkAt + 1.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const url = b.registrationUrl.startsWith('{{') ? 'REGISTRATION URL — SET IN CONFIG' : b.registrationUrl.replace(/^https?:\/\//, '');

  return (
    <AbsoluteFill style={{ background: ground, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ opacity: logoIn, transform: `translateY(${(1 - logoIn) * 10 * u}px)`, filter: `blur(${(1 - logoIn) * 6 * u}px)` }}>
          {b.recoverLogo ? (
            <Img src={staticFile(b.recoverLogo)} style={{ width: logoW, height: logoW / LOGO_RATIO, display: 'block' }} />
          ) : (
            <div style={{ fontFamily: fonts.sans, fontSize: 74 * u, color: fg }}>{b.productName}</div>
          )}
        </div>
        <div style={{ marginTop: 34 * u, height: 2 * u, width: 360 * u * line, background: colours.gold }} />
        <div style={{ marginTop: 30 * u, textAlign: 'center' }}>
          {e.lines.map((l, i) => (
            <div key={l} style={{ opacity: fade(t, e.lineAt + i * 0.7), fontFamily: fonts.sans, fontWeight: 500, fontSize: 30 * u, letterSpacing: `${0.14 * 30 * u}px`, color: fg, lineHeight: 1.55 }}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 36 * u, opacity: fade(t, e.comingSoonAt), fontFamily: fonts.mono, fontWeight: 500, fontSize: 15 * u, letterSpacing: `${0.4 * 15 * u}px`, color: colours.gold }}>
          {e.comingSoon}
        </div>
        <div style={{ marginTop: 30 * u, opacity: fade(t, e.ctaAt, 0.6), textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: fonts.sans, fontWeight: 600, fontSize: 21 * u, letterSpacing: `${0.18 * 21 * u}px`, color: light ? '#FFFFFF' : colours.ink, background: light ? colours.ink : colours.paper, padding: `${15 * u}px ${30 * u}px`, borderRadius: 3 * u }}>
            {b.cta} <span style={{ color: colours.gold }}>→</span>
          </div>
          <div style={{ marginTop: 14 * u, fontFamily: fonts.mono, fontSize: 14 * u, letterSpacing: `${0.12 * 14 * u}px`, color: sub }}>{url}</div>
        </div>
      </div>
      {b.legalFooter && (
        <div style={{ position: 'absolute', bottom: H * 0.05, fontFamily: fonts.sans, fontSize: 11 * u, color: sub, opacity: fade(t, e.ctaAt) }}>{b.legalFooter}</div>
      )}
    </AbsoluteFill>
  );
};
