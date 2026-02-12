import{j as a}from"./jsx-runtime-D_zvdyIk.js";import{a as s}from"./utils-CkYB-R1u.js";const n=({list:u,selectedValue:p,onChange:d,className:c})=>a.jsx("div",{role:"tablist",className:s("flex",c),children:u.map(e=>{const t=e.value===p;return a.jsx("button",{type:"button",role:"tab","aria-selected":t,className:s("px-4 py-2 text-base font-bold leading-[22px] text-center cursor-pointer transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",t?"border-gray-90 text-gray-90":"border-transparent text-gray-50 hover:text-gray-70"),onClick:()=>d(e.value),children:e.label},e.value)})});n.__docgenInfo={description:"",methods:[],displayName:"Tab",props:{list:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  value: string;
  label: string;
}`,signature:{properties:[{key:"value",value:{name:"string",required:!0}},{key:"label",value:{name:"string",required:!0}}]}}],raw:`Array<{
  value: string;
  label: string;
}>`},description:""},selectedValue:{required:!0,tsType:{name:"string"},description:""},onChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const g={component:n},r={render:()=>a.jsx(n,{list:[{value:"PREPARE_TEAM",label:"준비팀"},{value:"MISSIONARY_TEAM",label:"선교팀"}],selectedValue:"PREPARE_TEAM",onChange:()=>null})};var i,l,o;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <Tab list={[{
    value: TeamType.PREPARE_TEAM,
    label: '준비팀'
  }, {
    value: TeamType.MISSIONARY_TEAM,
    label: '선교팀'
  }]} selectedValue={TeamType.PREPARE_TEAM} onChange={() => null} />
}`,...(o=(l=r.parameters)==null?void 0:l.docs)==null?void 0:o.source}}};const v=["Primary"];export{r as Primary,v as __namedExportsOrder,g as default};
