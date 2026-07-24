import Swal from "sweetalert2";

export function alert_success() {
  Swal.fire({
    title: "Sucesso!",
    text: "Operação realizada com sucesso.",
    icon: "success",
    confirmButtonText: "OK",
  });
}

export function alert_error() {
  Swal.fire({
    icon: "error",
    title: "Error!",
    text: "Falha na operação.",
    confirmButtonText: "OK",
  });
}
