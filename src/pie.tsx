import { GenshinResult, GenshinTimeLine, GroupData } from './interfaces'
import { EChartsOption } from 'echarts-for-react';
import { Box } from '@mui/material';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import Timeline from './timeline';

echarts.use([PieChart, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

function SinglePie(props: { data: GroupData }) {
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
            <ReactEChartsCore echarts={echarts} option={option} />
        </Box>
    );
}
export default function Pie(props: { data: GenshinResult<GroupData>, timelineData: GenshinTimeLine }) {
    return (
        <Box sx={{
            paddingTop: 2,
            overflowX: 'hidden'//摆烂了
        }} >
            <Timeline data={props.timelineData} />
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                overflowX: 'hidden'//摆烂了
            }}
            >
                <SinglePie data={props.data.character} />
                <SinglePie data={props.data.weapon} />
                <SinglePie data={props.data.standard} />
            </Box>
        </Box>
    );
}