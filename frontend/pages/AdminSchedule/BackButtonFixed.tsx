import { Box, Button } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

export default function BackButtonFixed({ onClick }: { onClick: () => void }) {
  return (
    <Box
      component="footer"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "white",
        padding: "12px 16px",
        borderTop: "1px solid #eee",
        zIndex: 1000,
      }}
    >
      <Box style={{ maxWidth: 420, margin: "0 auto" }}>
        <Button
          fullWidth
          size="md"
          variant="outline"
          color="black"
          onClick={onClick}
          leftIcon={<IconArrowLeft size={16} />}
          styles={{
            root: {
              color: "#000",
              border: "1px solid #000",
              borderRadius: 12,
              fontWeight: 500,
              backgroundColor: "#fff",
              transition: "background 0.2s",
              "&:hover": { backgroundColor: "#f2f2f2" },
            },
          }}
        >
          Назад к профилю
        </Button>
      </Box>
    </Box>
  );
}
