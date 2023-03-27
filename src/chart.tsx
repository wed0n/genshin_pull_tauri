import { useRef, useState } from 'react';
import { Box, Dialog, DialogContent } from '@mui/material';
import Timeline, { DayPullsTable } from './timeline';
import { GenshinPullsTableItem, GenshinResult, GenshinTimeLine, GroupData } from './interfaces';
import Pie from './pie';

export default function Chart(props: { data: GenshinResult<GroupData>, timelineData: GenshinTimeLine }) {
    const [opened, setOpened] = useState(false);
    const tableData = useRef([] as GenshinPullsTableItem[]);
    return (
        <Box sx={{
            paddingTop: 2,
            overflowX: 'hidden'//摆烂了
        }} >
            <Dialog fullWidth={true} maxWidth="md" open={opened} onClose={
                () => {
                    setOpened(false);
                    //setData([]);
                }}>
                <DialogContent id="dialogTable" >
                    <DayPullsTable data={tableData.current} />
                </DialogContent>
            </Dialog>
            <Timeline data={props.timelineData} tableData={tableData} setOpened={setOpened} />
            <Pie data={props.data} tableData={tableData} setOpened={setOpened} />
        </Box>
    );
}