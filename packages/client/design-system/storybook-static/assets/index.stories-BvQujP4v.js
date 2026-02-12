import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{r as p}from"./index-DwQS_Y10.js";import{R as a}from"./index-CoFOHudc.js";import"./useMergeRefs-BEMI1pRo.js";import"./utils-CkYB-R1u.js";const v={component:a,title:"Components/Radio",parameters:{layout:"centered"},tags:["autodocs"]};function m(){const[l,c]=p.useState("a");return e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx(a,{value:"a",checked:l==="a",onChange:()=>c("a"),label:"Option A"}),e.jsx(a,{value:"b",checked:l==="b",onChange:()=>c("b"),label:"Option B"}),e.jsx(a,{value:"c",checked:l==="c",onChange:()=>c("c"),label:"Option C"})]})}const s={render:()=>e.jsx(m,{})},r={render:()=>e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx(a,{value:"a",checked:!1,disabled:!0,label:"Disabled unchecked"}),e.jsx(a,{value:"b",checked:!0,disabled:!0,label:"Disabled checked"})]})};var d,o,t;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <DefaultRadio />
}`,...(t=(o=s.parameters)==null?void 0:o.docs)==null?void 0:t.source}}};var n,i,u;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-3">
      <Radio value="a" checked={false} disabled label="Disabled unchecked" />
      <Radio value="b" checked={true} disabled label="Disabled checked" />
    </div>
}`,...(u=(i=r.parameters)==null?void 0:i.docs)==null?void 0:u.source}}};const j=["Default","Disabled"];export{s as Default,r as Disabled,j as __namedExportsOrder,v as default};
