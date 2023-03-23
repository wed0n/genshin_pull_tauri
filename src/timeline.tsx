import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { TooltipComponent, TitleComponent, LegendComponent, GridComponent, DataZoomComponent, ToolboxComponent, MarkPointComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { Box } from '@mui/material';
import { EChartsOption } from 'echarts-for-react';
import { GenshinTimeLine } from './interfaces';
echarts.use([BarChart, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer, GridComponent, DataZoomComponent, ToolboxComponent, MarkPointComponent]);
export default function TimeLine(props: { data: GenshinTimeLine }) {
    let xAxis = [];
    let star5 = [];
    let star4 = [];
    let star3 = [];
    for (let item of props.data.items) {
        xAxis.push(item.time);
        star5.push(item.star5);
        star4.push(item.star4);
        star3.push(item.star3);
    }
    let option: EChartsOption = {
        color: ['#6ABCE6', '#CC99FF', '#FFD173'],
        legend: { top: 25 },
        title: {
            "left": "center",
            "text": `${props.data.begin_time} - ${props.data.end_time} (共${props.data.total}抽)`,
        },
        xAxis: {
            data: xAxis
        },
        yAxis: {
            type: 'value',
            boundaryGap: false,
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 100,
                end: 0
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter(series: any[]) {
                if (series.length === 0) return '';
                const day = series[0].axisValue;
                let total = 0;
                let target = '';
                series.reverse().map(
                    (data) => {
                        total += data.data;
                        target += `<div>
                        ${data.marker}
                        <span style="margin-left:2px">${data.seriesName}</span>
                        <span style="float:right;margin-left:20px;font-weight:900;color=${data.color}">${data.value}</span>
                  </div>`
                    }
                )
                return `<div style="font-size:14px;color:#666;font-weight:400;line-height:1.5;">
                <div>${day}</div>
                <div>当日抽卡次数: <span style="font-weight:900">${total}<span></div>
                ${target}
                </div>`;
            },
        },
        series: [
            {
                name: "三星",
                data: star3,
                type: 'bar',
                stack: 'x'
            },
            {
                name: "四星",
                data: star4,
                type: 'bar',
                stack: 'x'
            },
            {
                name: "五星",
                data: star5,
                type: 'bar',
                stack: 'x'
            }
        ]
    };
    return (
        <Box sx={{ width: 900, marginX: 'auto', marginY: 2 }}>
            <ReactEChartsCore echarts={echarts} option={option} />
        </Box>
    );
}