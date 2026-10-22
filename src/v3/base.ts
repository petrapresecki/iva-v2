// Where v3 lives. Locally it sits at /v3 next to the earlier versions; the deployed build
// (VITE_V3_ROOT=1) serves only v3, from the root.
export const V3_ROOT = import.meta.env.VITE_V3_ROOT === '1'
export const V3 = V3_ROOT ? '' : '/v3'
/** v3's home: '/' when deployed at the root, else '/v3' */
export const V3_HOME = V3 || '/'
