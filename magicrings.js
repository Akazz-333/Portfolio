/* ==========================================================================
   REACT BITS MAGIC RINGS COMPONENT — VANILLA JS + THREE.JS IMPLEMENTATION
   - GLSL Concentric Ring Animation Engine
   - Interactive Mouse Follow, Parallax & Click Burst
   - Dual Theme Color Adaptation (Cyber Cyan ↔ Arachnid Gold)
   ========================================================================== */

(function () {
  'use strict';

  const vertexShader = `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    uniform float uTime, uAttenuation, uLineThickness;
    uniform float uBaseRadius, uRadiusStep, uScaleRate;
    uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
    uniform float uFadeIn, uFadeOut;
    uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
    uniform float uCoverageAlpha;
    uniform vec2 uResolution, uMouse;
    uniform vec3 uColor, uColorTwo;
    uniform int uRingCount;

    const float HP = 1.5707963;
    const float CYCLE = 3.45;

    float fade(float t) {
      return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
    }

    float ring(vec2 p, float ri, float cut, float t0, float px) {
      float t = mod(uTime + t0, CYCLE);
      float r = ri + t / CYCLE * uScaleRate;
      float d = abs(length(p) - r);
      float a = atan(abs(p.y), abs(p.x)) / HP;
      float th = max(1.0 - a, 0.5) * px * uLineThickness;
      float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
      d += pow(cut * a, 3.0) * r;
      return h * exp(-uAttenuation * d) * fade(t);
    }

    void main() {
      float px = 1.0 / min(uResolution.x, uResolution.y);
      vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
      float cr = cos(uRotation), sr = sin(uRotation);
      p = mat2(cr, -sr, sr, cr) * p;
      p -= uMouse * uMouseInfluence;
      float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
      p /= sc;
      vec3 c = vec3(0.0);
      float coverage = 0.0;
      float rcf = max(float(uRingCount) - 1.0, 1.0);
      for (int i = 0; i < 10; i++) {
        if (i >= uRingCount) break;
        float fi = float(i);
        vec2 pr = p - fi * uParallax * uMouse;
        vec3 rc = mix(uColor, uColorTwo, fi / rcf);
        float ringAmount = ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px);
        c = mix(c, rc, vec3(ringAmount));
        coverage = max(coverage, ringAmount);
      }
      c *= 1.0 + uBurst * 2.0;
      float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
      c += (n - 0.5) * uNoiseAmount;
      float intensity = max(c.r, max(c.g, c.b));
      vec3 emissiveColor = intensity > 0.0001 ? clamp(c / intensity, 0.0, 1.0) : vec3(0.0);
      vec3 outputColor = mix(emissiveColor, clamp(c, 0.0, 1.0), uCoverageAlpha);
      float outputAlpha = mix(intensity, coverage, uCoverageAlpha);
      gl_FragColor = vec4(outputColor, clamp(outputAlpha * uOpacity, 0.0, 1.0));
    }
  `;

  function initMagicRings(containerId, options = {}) {
    const mount = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!mount) return null;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js is required for MagicRings');
      return null;
    }

    const {
      color = '#38bdf8',
      colorTwo = '#818cf8',
      speed = 1,
      ringCount = 6,
      attenuation = 10,
      lineThickness = 2,
      baseRadius = 0.35,
      radiusStep = 0.1,
      scaleRate = 0.1,
      opacity = 0.85,
      blur = 0,
      noiseAmount = 0.08,
      rotation = 0,
      ringGap = 1.5,
      fadeIn = 0.7,
      fadeOut = 0.5,
      followMouse = true,
      mouseInfluence = 0.15,
      hoverScale = 1.15,
      parallax = 0.04,
      clickBurst = true,
      alphaMode = 'luminance'
    } = options;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) {
      return null;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    if (blur > 0) {
      mount.style.filter = `blur(${blur}px)`;
    }

    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      uTime: { value: 0 },
      uAttenuation: { value: attenuation },
      uResolution: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color(color) },
      uColorTwo: { value: new THREE.Color(colorTwo) },
      uLineThickness: { value: lineThickness },
      uBaseRadius: { value: baseRadius },
      uRadiusStep: { value: radiusStep },
      uScaleRate: { value: scaleRate },
      uRingCount: { value: ringCount },
      uOpacity: { value: opacity },
      uNoiseAmount: { value: noiseAmount },
      uRotation: { value: (rotation * Math.PI) / 180 },
      uRingGap: { value: ringGap },
      uFadeIn: { value: fadeIn },
      uFadeOut: { value: fadeOut },
      uMouse: { value: new THREE.Vector2() },
      uMouseInfluence: { value: followMouse ? mouseInfluence : 0 },
      uHoverAmount: { value: 0 },
      uHoverScale: { value: hoverScale },
      uParallax: { value: parallax },
      uBurst: { value: 0 },
      uCoverageAlpha: { value: alphaMode === 'coverage' ? 1 : 0 }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(quad);

    const mouse = [0, 0];
    const smoothMouse = [0, 0];
    let hoverAmount = 0;
    let isHovered = false;
    let burst = 0;

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);
      uniforms.uResolution.value.set(w * dpr, h * dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse[0] = (e.clientX - rect.left) / rect.width - 0.5;
      mouse[1] = -((e.clientY - rect.top) / rect.height - 0.5);
    };

    const onMouseEnter = () => { isHovered = true; };
    const onMouseLeave = () => {
      isHovered = false;
      mouse[0] = 0;
      mouse[1] = 0;
    };
    const onClick = () => {
      if (clickBurst) burst = 1;
    };

    window.addEventListener('mousemove', onMouseMove);
    mount.addEventListener('mouseenter', onMouseEnter);
    mount.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick);

    let animationFrameId = 0;
    let lastTime = 0;
    let elapsed = 0;

    const animate = (t) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = lastTime === 0 ? 0 : Math.min(t - lastTime, 100);
      lastTime = t;
      elapsed += dt * 0.001 * speed;

      smoothMouse[0] += (mouse[0] - smoothMouse[0]) * 0.08;
      smoothMouse[1] += (mouse[1] - smoothMouse[1]) * 0.08;
      hoverAmount += ((isHovered ? 1 : 0) - hoverAmount) * 0.08;

      burst *= 0.95;
      if (burst < 0.001) burst = 0;

      uniforms.uTime.value = elapsed;
      uniforms.uMouse.value.set(smoothMouse[0], smoothMouse[1]);
      uniforms.uHoverAmount.value = hoverAmount;
      uniforms.uBurst.value = burst;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const api = {
      updateColors: (c1, c2) => {
        uniforms.uColor.value.set(c1);
        uniforms.uColorTwo.value.set(c2);
      },
      destroy: () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMouseMove);
        mount.removeEventListener('mouseenter', onMouseEnter);
        mount.removeEventListener('mouseleave', onMouseLeave);
        window.removeEventListener('click', onClick);
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
        material.dispose();
      }
    };

    return api;
  }

  window.initMagicRings = initMagicRings;
})();
