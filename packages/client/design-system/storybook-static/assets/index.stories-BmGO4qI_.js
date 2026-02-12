import{j as e}from"./jsx-runtime-D_zvdyIk.js";import{a as n}from"./utils-CkYB-R1u.js";const u={4:"h-1",10:"h-2.5",12:"h-3",24:"h-6"};function a({height:h=4,orientation:m="horizontal",className:t}){return m==="vertical"?e.jsx("div",{className:n("w-px self-stretch bg-gray-20",t),role:"separator","aria-orientation":"vertical"}):e.jsx("div",{className:n("w-full bg-gray-20",u[h],t),role:"separator","aria-orientation":"horizontal"})}a.displayName="Divider";a.__docgenInfo={description:"",methods:[],displayName:"Divider",props:{height:{required:!1,tsType:{name:"union",raw:"4 | 10 | 12 | 24",elements:[{name:"literal",value:"4"},{name:"literal",value:"10"},{name:"literal",value:"12"},{name:"literal",value:"24"}]},description:"",defaultValue:{value:"4",computed:!1}},orientation:{required:!1,tsType:{name:"union",raw:"'horizontal' | 'vertical'",elements:[{name:"literal",value:"'horizontal'"},{name:"literal",value:"'vertical'"}]},description:"",defaultValue:{value:"'horizontal'",computed:!1}},className:{required:!1,tsType:{name:"string"},description:""}}};const g={component:a,title:"Components/Divider",parameters:{layout:"centered"},tags:["autodocs"]},i={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"20px",width:"300px"},children:[e.jsx(a,{height:4}),e.jsx(a,{height:10}),e.jsx(a,{height:12}),e.jsx(a,{height:24})]})},r={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px",height:"100px",alignItems:"center"},children:[e.jsx("span",{children:"Left"}),e.jsx(a,{orientation:"vertical"}),e.jsx("span",{children:"Center"}),e.jsx(a,{orientation:"vertical"}),e.jsx("span",{children:"Right"})]})};var s,l,o;i.parameters={...i.parameters,docs:{...(s=i.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '300px'
  }}>
      <Divider height={4} />
      <Divider height={10} />
      <Divider height={12} />
      <Divider height={24} />
    </div>
}`,...(o=(l=i.parameters)==null?void 0:l.docs)==null?void 0:o.source}}};var d,p,c;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    height: '100px',
    alignItems: 'center'
  }}>
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Center</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
}`,...(c=(p=r.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};const f=["Horizontal","Vertical"];export{i as Horizontal,r as Vertical,f as __namedExportsOrder,g as default};
