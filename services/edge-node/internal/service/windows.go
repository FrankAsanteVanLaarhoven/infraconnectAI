// +build windows

package service

import (
	"golang.org/x/sys/windows/svc"
	"log"
)

type GrokService struct{}

func (m *GrokService) Execute(args []string, r svc.ChangeRequest, changes chan<- svc.Status) (ssec bool, errno uint32) {
	const cmdsAccepted = svc.AcceptStop | svc.AcceptShutdown
	changes <- svc.Status{State: svc.StartPending}

	// Start agent in background
	// go RunAgent()

	changes <- svc.Status{State: svc.Running, Accepts: cmdsAccepted}

	for {
		select {
		case c := <-r:
			switch c.Cmd {
			case svc.Interrogate:
				changes <- c.CurrentStatus
			case svc.Stop, svc.Shutdown:
				changes <- svc.Status{State: svc.StopPending}
				return false, 0
			}
		}
	}
}

func InstallWindowsService() error {
	log.Println("Windows service installation not fully automated yet - use NSSM or sc.exe")
	return nil
}
