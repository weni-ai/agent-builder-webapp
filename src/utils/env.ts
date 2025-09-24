export default function env(name: string) {
  const envData =
    // @ts-expect-error - window.configs is not defined in the browser but is a fallback
    // eslint-disable-next-line no-undef
    process.env?.[name] || window?.configs?.[name] || import.meta.env[name];

  return envData;
}