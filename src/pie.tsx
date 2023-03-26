import { GenshinPullsTableItem, GenshinResult, GenshinTimeLine, GroupData } from './interfaces'
import { EChartsOption } from 'echarts-for-react';
import { Box, Dialog, DialogContent } from '@mui/material';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import Timeline, { DayPullsTable } from './timeline';
import { useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api';

echarts.use([PieChart, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

function SinglePie(props: { data: GroupData, message:{tableName:string,gachaType:number},outData: React.MutableRefObject<GenshinPullsTableItem[]>, opened: React.MutableRefObject<boolean>}) {
    let option: EChartsOption = {
        color: [
            '#F5AE1E',
            '#FFD173',
            '#CC66FF',
            '#CC99FF',
            '#6ABCE6',
        ],
        title: {
            text: props.data.name,
            left: 'center',
            top: 5,
        },
        tooltip: {
            trigger: 'item',
        },
        legend: {
            top: 30,
            left: 'center',
            selected: { '三星武器': false },
        },
        series: [
            {
                name: props.data.name,
                type: 'pie',
                top: 30,
                radius: ['40%', '70%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: false,
                        fontSize: 20,
                        fontWeight: 'bold',
                    }
                },
                labelLine: {
                    show: true
                },
                data: [
                    { value: props.data.character5, name: '五星角色' },
                    { value: props.data.weapon5, name: '五星武器' },
                    { value: props.data.character4, name: '四星角色' },
                    { value: props.data.weapon4, name: '四星武器' },
                    { value: props.data.weapon3, name: '三星武器' }
                ]
            }
        ]
    };
    return (
        <Box sx={{ width: 360, marginX: 2, marginY: 2 }}>
            <ReactEChartsCore echarts={echarts} option={option}
                onEvents={{
                    click: (args: {dataIndex:number}) => {
                        let rank,itemType;
                        if(args.dataIndex==4){
                            rank=3;
                            itemType=0;
                        }
                        else{
                            rank=5-Math.floor(args.dataIndex/2);
                            itemType=(args.dataIndex%2+1)%2;
                        }
                        
                        (async ()=>{
                            let result:GenshinPullsTableItem[] = await invoke("get_pulls_by_group",{gachaType: props.message.gachaType, tableName: props.message.tableName, itemType: itemType,rank:rank});
                            props.outData.current=result;
                            props.opened.current=true;
                        })();
                    }
                }} />
        </Box>
    );
}
export default function Pie(props: { data: GenshinResult<GroupData>, timelineData: GenshinTimeLine }) {
    const opened = useRef(false);
    const outData = useRef([] as GenshinPullsTableItem[]);
    return (
        <Box sx={{
            paddingTop: 2,
            overflowX: 'hidden'//摆烂了
        }} >
            <Dialog fullWidth={true} maxWidth="md" open={opened.current} onClose={
                () => {
                    opened.current=false;
                    //setData([]);
                }}>
                <DialogContent id="dialogTable" >
                    <DayPullsTable data={outData.current} />
                </DialogContent>
            </Dialog>
            <Timeline data={props.timelineData} outData={outData} opened={opened} />
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                overflowX: 'hidden'//摆烂了
            }}
            >
                <SinglePie data={props.data.character} message={{gachaType:301,tableName:"character_wish"}} outData={outData} opened={opened} />
                <SinglePie data={props.data.weapon} message={{gachaType:302,tableName:"weapon_wish"}} outData={outData} opened={opened} />
                <SinglePie data={props.data.standard} message={{gachaType:200,tableName:"standard_wish"}} outData={outData} opened={opened} />
            </Box>
        </Box>
    );
}