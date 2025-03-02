import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, Container, Divider, Drawer, IconButton, MenuItem, Toolbar } from "@mui/material";
import { alpha, styled, Theme } from '@mui/material/styles';
import * as React from 'react';
import LoginButton from './GoogleLoginButton';

interface CustomTheme extends Theme {
    vars?: {
        palette: {
            divider: string;
            background: {
                defaultChannel: string;
            };
        };
    };
}

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
    backdropFilter: 'blur(24px)',
    border: '1px solid',
    borderColor: (theme as CustomTheme).vars?.palette.divider || theme.palette.divider,
    backgroundColor: (theme as CustomTheme).vars
        ? `rgba(${(theme as CustomTheme).vars!.palette.background.defaultChannel} / 0.4)`
        : alpha(theme.palette.background.default, 0.4),
    boxShadow: (theme as CustomTheme).shadows[1],
    padding: '8px 12px',
}));

export default function NavBar() {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    return (
        <AppBar
            position="fixed"
            enableColorOnDark
            sx={{
                boxShadow: 0,
                bgcolor: 'transparent',
                backgroundImage: 'none',
                mt: 'calc(var(--template-frame-height, 0px) + 28px)',
            }}>
            <Container maxWidth="lg">
                <StyledToolbar variant="dense" disableGutters>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Button variant="text" color="info" size="small" href="/#">
                                Home
                            </Button>
                            <Button variant="text" color="info" size="small" href="/#about">
                                About
                            </Button>
                            <Button variant="text" color="info" size="small" href="/contact">
                                Contact
                            </Button>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                        display: { xs: 'none', md: 'flex' },
                        gap: 1,
                        alignItems: 'center',
                        }}
                    >
                        <LoginButton/>
                        {/* <ColorModeIconDropdown /> */}
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
                        {/* <ColorModeIconDropdown size="medium" /> */}
                        <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                        anchor="top"
                        open={open}
                        onClose={toggleDrawer(false)}
                        PaperProps={{
                            sx: {
                            top: 'var(--template-frame-height, 0px)',
                            },
                        }}
                        >
                            <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                                <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                                >
                                    <IconButton onClick={toggleDrawer(false)}>
                                        <CloseRoundedIcon />
                                    </IconButton>
                                </Box>

                                <MenuItem>
                                    <Button variant="text" color="info" size="small" href="/#">
                                        Home
                                    </Button>
                                </MenuItem>
                                <MenuItem>
                                    <Button variant="text" color="info" size="small" href="/#about">
                                        About
                                    </Button>
                                </MenuItem>
                                <MenuItem>
                                    <Button variant="text" color="info" size="small">
                                        Contact
                                    </Button>
                                </MenuItem>
                                <MenuItem>
                                    <Button variant="text" color="info" size="small" sx={{ minWidth: 0 }}>
                                        FAQ
                                    </Button>
                                </MenuItem>

                                <Divider sx={{ my: 3 }} />

                                <LoginButton />
                            </Box>
                        </Drawer>
                    </Box>
                </StyledToolbar>
            </Container>
        </AppBar>
    )
}