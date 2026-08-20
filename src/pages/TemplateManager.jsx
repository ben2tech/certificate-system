import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";

import {
  Add,
  Edit,
  ContentCopy,
  Delete,
  CheckCircle
} from "@mui/icons-material";

import { getTemplates } from "../services/adminApi";

export default function TemplateManager() {

  const [templates,setTemplates]=useState([]);
  const [open,setOpen]=useState(false);
  const [name,setName]=useState("");

  useEffect(()=>{
    load();
  },[]);

  async function load(){

    const res=await getTemplates();

    setTemplates(res.data||[]);

  }

  function createTemplate(){

    setName("");

    setOpen(true);

  }

  function duplicate(t){

    alert(`ทำสำเนา Template : ${t.activity}`);

  }

  function rename(t){

    setName(t.activity);

    setOpen(true);

  }

  function remove(t){

    if(confirm(`ลบ ${t.activity} ?`)){

      alert("ตัวอย่างระบบลบ (เชื่อม API ขั้นถัดไป)");

    }

  }

  return(

    <Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >

        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
        >
          🎨 Template Manager
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add/>}
          onClick={createTemplate}
        >
          สร้าง Template
        </Button>

      </Stack>

      <Stack spacing={2}>

        {templates.map((t,index)=>(

          <Card
            key={index}
            sx={{borderRadius:4}}
          >

            <CardContent>

              <Stack
                direction={{xs:"column",md:"row"}}
                justifyContent="space-between"
                alignItems={{xs:"stretch",md:"center"}}
                spacing={2}
              >

                <Box>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    {t.activity}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Prefix : {t.prefix}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt:1,
                      wordBreak:"break-all"
                    }}
                  >
                    {t.templateId}
                  </Typography>

                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                >

                  <Chip
                    icon={<CheckCircle/>}
                    label="Active"
                    color="success"
                  />

                  <IconButton
                    onClick={()=>rename(t)}
                  >
                    <Edit/>
                  </IconButton>

                  <IconButton
                    onClick={()=>duplicate(t)}
                  >
                    <ContentCopy/>
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={()=>remove(t)}
                  >
                    <Delete/>
                  </IconButton>

                </Stack>

              </Stack>

            </CardContent>

          </Card>

        ))}

        {templates.length===0&&(

          <Paper
            sx={{
              p:5,
              textAlign:"center",
              borderRadius:4
            }}
          >

            <Typography color="text.secondary">
              ยังไม่มี Template
            </Typography>

          </Paper>

        )}

      </Stack>

      <Dialog
        open={open}
        onClose={()=>setOpen(false)}
        fullWidth
      >

        <DialogTitle>
          Template
        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="normal"
            label="ชื่อกิจกรรม"
            value={name}
            onChange={e=>setName(e.target.value)}
          />

        </DialogContent>

        <DialogActions>

          <Button
            onClick={()=>setOpen(false)}
          >
            ยกเลิก
          </Button>

          <Button
            variant="contained"
            onClick={()=>{

              alert("เชื่อม API ในขั้นถัดไป");

              setOpen(false);

            }}
          >
            บันทึก
          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}