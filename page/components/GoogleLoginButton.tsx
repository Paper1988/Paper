"use client";
import { Avatar, Box, Button, IconButton, Menu, Tooltip } from '@mui/material';
import { signIn, signOut, useSession } from "next-auth/react";
import { MouseEvent, useState } from 'react';

export default function LoginButton() {
    const { data: session } = useSession();
    const [ anchorElUser, setAnchorElUser ] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <>
            {session ? (
                <Box sx={{ flexGrow: 0 }}>
                    <Tooltip title={session.user?.name}>
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }} className='rounded-full'>
                            <Avatar src={session.user?.image ?? ""} />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        sx={{ mt: '45px' }}
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        <Button variant="text" color="info" size="small" href="/dashboard" sx={{ marginLeft: 2 }}>
                            Dashboard
                        </Button>
                        <Button variant="text" color="info" size="small" href="/profile" sx={{ marginLeft: 2 }}>
                            Profile
                        </Button>
                        <Button variant="text" color="info" size="small" sx={{ textAlign: 'center', marginLeft: 0.5, marginRight: 2 }} onClick={() => signOut()}>登出</Button>
                    </Menu>
                </Box>
            ) : (
                <Button variant="outlined" onClick={() => signIn("google")}>使用 Google 登入</Button>
            )}
        </>
    );
}