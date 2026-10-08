import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import film from '../config/film.config';
import { colours, fonts, unit } from '../lib/theme';

const fade = (t: number, at: number, d = 0.8) =>
  interpolate(t, [at, at + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = 53 + frame / fps; // sequence starts at 53s
  const u = unit(W, H);
  const wm = (H > W ? 56 : 74) * u; // portrait wordmark stays inside title-safe
  const e = film.endCard, b = film.brand;
  const line = interpolate(t, [e.wordmarkAt + 0.3, e.wordmarkAt + 1.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const [parent, ...rest] = b.productName.split(' ');
  const url = b.registrationUrl.startsWith('{{') ? 'REGISTRATION URL — SET IN CONFIG' : b.registrationUrl.replace(/^https?:\/\//, '');
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #0d1114 0%, ${colours.ink} 70%)`, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{ opacity: fade(t, e.wordmarkAt, 1.2), filter: `blur(${(1 - fade(t, e.wordmarkAt, 1.2)) * 8 * u}px)` }}>
          {b.recoverLogo ? (
            <Img src={staticFile(b.recoverLogo)} style={{ height: 70 * u }} />
          ) : (
            <div style={{ fontFamily: fonts.sans, fontSize: wm, letterSpacing: `${0.3 * wm}px`, color: colours.paper, marginRight: -0.3 * wm }}>
              <span style={{ fontWeight: 600 }}>{parent}</span>{' '}
              <span style={{ fontWeight: 300 }}>{rest.join(' ')}</span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 26 * u, height: 1.5 * u, width: 520 * u * line, background: `linear-gradient(90deg, transparent, ${colours.accent}, transparent)`, boxShadow: `0 0 ${14 * u}px ${colours.accent}` }} />
        <div style={{ marginTop: 34 * u, textAlign: 'center' }}>
          {e.lines.map((l, i) => (
            <div key={l} style={{ opacity: fade(t, e.lineAt + i * 0.7), fontFamily: fonts.sans, fontWeight: 400, fontSize: 30 * u, letterSpacing: `${0.16 * 30 * u}px`, color: colours.paper, lineHeight: 1.6 }}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 40 * u, opacity: fade(t, e.comingSoonAt), fontFamily: fonts.mono, fontSize: 15 * u, letterSpacing: `${0.4 * 15 * u}px`, color: colours.accent }}>
          {e.comingSoon}
        </div>
        <div style={{ marginTop: 34 * u, opacity: fade(t, e.ctaAt, 0.6), textAlign: 'center' }}>
          <div style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: 22 * u, letterSpacing: `${0.2 * 22 * u}px`, color: colours.paper, border: `${1 * u}px solid rgba(233,236,239,0.35)`, padding: `${14 * u}px ${28 * u}px` }}>
            {b.cta} →
          </div>
          <div style={{ marginTop: 14 * u, fontFamily: fonts.mono, fontSize: 14 * u, letterSpacing: `${0.12 * 14 * u}px`, color: colours.muted }}>{url}</div>
        </div>
      </div>
      {b.legalFooter && (
        <div style={{ position: 'absolute', bottom: H * 0.05, fontFamily: fonts.sans, fontSize: 11 * u, color: colours.muted, opacity: fade(t, e.ctaAt) }}>{b.legalFooter}</div>
      )}
    </AbsoluteFill>
  );
};
