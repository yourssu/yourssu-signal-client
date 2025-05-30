import { viewerSelfAtom } from "@/atoms/viewerSelf";
import TopBar from "@/components/TopBar";
import { VerifyStep } from "@/components/verify/VerifyStep";
import {
  useNotificationDeposit,
  useViewerSelf,
  useViewerVerification,
} from "@/hooks/queries/viewers";
import { useUserUuid } from "@/hooks/useUserUuid";
import { Package } from "@/types/viewer";
import { useFunnel } from "@use-funnel/react-router";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import PackageSelectionStep from "@/components/verify/PackageSelectionStep";
import {
  buttonClick,
  funnelComplete,
  funnelStart,
  funnelStep,
  purchaseTickets,
  selectPackage,
  viewPackages,
} from "@/lib/analytics";
import { userProfileAtom } from "@/atoms/userProfile";

const ProfileVerificationPage: React.FC = () => {
  const [viewer, setViewer] = useAtom(viewerSelfAtom);
  const profile = useAtomValue(userProfileAtom);
  const funnel = useFunnel<{
    packageSelection: { package?: Package };
    verify: { package: Package };
  }>({
    id: "verify",
    initial: {
      step: "packageSelection",
      context: {},
    },
  });
  const navigate = useNavigate();
  const uuid = useUserUuid();
  const [isChecking, setIsChecking] = useState(false);

  const { data, isLoading: isVerificationLoading } =
    useViewerVerification(uuid);
  const verificationCode: number | null = useMemo(
    () => Number(data?.verificationCode ?? null) || null,
    [data],
  );

  const { data: viewerResponse, isRefetching } = useViewerSelf(uuid, {
    refetchInterval: isChecking && 1000,
  });
  const onSale = !!profile && (viewer?.ticket ?? 0) === 0;

  useEffect(() => {
    if (funnel.historySteps.length === 1) {
      funnelStart("verify", "티켓 구매");
      viewPackages(onSale);
    }
  }, [funnel.historySteps.length, onSale]);

  useEffect(() => {
    if (viewerResponse) {
      // Navigate if tickets are present (initial load or increase) or profile updated
      if (
        viewer === null ||
        viewer.updatedTime !== viewerResponse.updatedTime
      ) {
        setViewer(viewerResponse);
        purchaseTickets(funnel.context.package!, verificationCode!, onSale);
        funnelComplete("verify", "티켓 구매", funnel.context);
        navigate("/profile");
      }
    }
  }, [
    viewerResponse,
    setViewer,
    navigate,
    viewer,
    isRefetching,
    funnel.context,
    verificationCode,
    onSale,
  ]);

  const handlePackageSelect = (ticketPackage: Package) => {
    funnel.history.replace("packageSelection", { package: ticketPackage });
    funnel.history.push("verify", { package: ticketPackage });
    funnelStep("verify", "티켓 구매", "packageSelection", funnel.context);
    selectPackage(ticketPackage, onSale);
  };

  const handleBack = () => {
    if (funnel.index !== 0) {
      funnel.history.back();
    } else {
      navigate("/");
    }
  };

  const { mutate: sendRenameRequest } = useNotificationDeposit();

  const handleRenameRequested = (name: string) => {
    if (verificationCode) {
      sendRenameRequest({
        message: name,
        verificationCode,
      });
      buttonClick("send_rename_request", "이름 변경 요청");
    }
    setIsChecking(true);
  };

  return (
    // Main page container - Flex column, min height screen
    <div className="flex flex-col min-h-dvh">
      <TopBar onBack={handleBack} />
      {/* Content area - Takes remaining height, centers content */}
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Funnel container - Max width */}
        <div className="w-full max-w-md h-full flex flex-col grow items-stretch justify-stretch">
          <funnel.Render
            packageSelection={() => (
              <PackageSelectionStep
                isOnSale={onSale}
                onSelect={handlePackageSelect}
              />
            )}
            verify={() => (
              <VerifyStep
                pkg={funnel.context.package!}
                isLoading={isVerificationLoading}
                verificationCode={verificationCode}
                isChecking={isChecking}
                isOnSale={onSale}
                onStartCheck={() => setIsChecking(true)}
                onEndCheck={() => setIsChecking(false)}
                onRenameRequested={handleRenameRequested}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileVerificationPage;
