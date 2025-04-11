import{j as s,aF as g,aG as f,B as l,T as y,n as p,O as A,aH as h,aI as c,aJ as N,aK as v}from"./index-C-zTHRzx.js";import{R as C,r as u}from"./react-vendor-3Ywg6HeR.js";import"./map-vendor-Bbrwb_BN.js";import"./utilities-BiTQLgRB.js";const I=({value:t,onChange:o,children:a,variant:e="standard",className:n=""})=>{const r={standard:"",fullWidth:"grid",scrollable:"overflow-x-auto flex scrollbar-thin"},i=C.Children.count(a),d=e==="fullWidth"?`grid-cols-${i}`:"";return s.jsx("div",{className:`
        border-b border-slate-700/50
        ${r[e]}
        ${e==="fullWidth"?d:""}
        ${n}
      `,role:"tablist",children:a})},x=({label:t,value:o=0,disabled:a=!1,icon:e,className:n=""})=>{const r=o===(o??0);return s.jsxs("button",{role:"tab","aria-selected":r,disabled:a,className:`
        inline-flex items-center justify-center
        px-4 py-2.5 text-sm font-medium
        border-b-2 -mb-px
        focus-visible:outline-none
        transition-all duration-200
        ${r?"text-primary-400 border-primary-400":"text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-600"}
        ${a?"opacity-50 cursor-not-allowed":"cursor-pointer"}
        ${n}
      `,children:[e&&s.jsx("span",{className:"mr-2",children:e}),t]})},E=()=>{const[t,o]=u.useState(0),[a,e]=u.useState(!1),{hasStoredAssets:n,loadAssetLists:r}=g(),{setIsCreateJsonOpen:i}=f(),d=(w,j)=>{o(j)},m=()=>{r()},b=()=>{i(!0)};return s.jsxs("div",{className:"p-6",children:[s.jsxs(l,{className:"flex justify-between items-center mb-6",children:[s.jsx(y,{variant:"h4",component:"h1",children:"Assets"}),s.jsxs("div",{className:"space-x-2",children:[s.jsx(p,{variant:"contained",color:"primary",onPress:()=>e(!0),children:"Import/Export Assets"}),t===2&&s.jsx(p,{variant:"outlined",color:"primary",startIcon:s.jsx(A,{}),onPress:b,children:"Create New JSON"})]})]}),n?s.jsxs(s.Fragment,{children:[s.jsx(l,{sx:{borderBottom:1,borderColor:"divider"},className:"mb-4",children:s.jsxs(I,{value:t,onChange:d,"aria-label":"asset tabs",children:[s.jsx(x,{label:"Audio"}),s.jsx(x,{label:"Images"}),s.jsx(x,{label:"Data"})]})}),s.jsx(l,{className:"hidden",sx:{display:t===0?"block":"none"},children:s.jsx(c,{type:"audio",title:"Audio"})}),s.jsx(l,{className:"hidden",sx:{display:t===1?"block":"none"},children:s.jsx(c,{type:"images",title:"Images"})}),s.jsx(l,{className:"hidden",sx:{display:t===2?"block":"none"},children:s.jsx(c,{type:"data",title:"Data"})}),s.jsx(N,{}),s.jsx(v,{}),a&&s.jsx(h,{dialogOpen:a,onClose:()=>e(!1),onAssetImport:m})]}):s.jsx(h,{isFullPage:!0,onAssetImport:m})]})};export{E as AssetsView};
//# sourceMappingURL=AssetsView-GBH9dwDr.js.map
